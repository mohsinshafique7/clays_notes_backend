import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Sleep Controller (e2e)', () => {
  let availableId: number;
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  describe('Sleep Record', () => {
    describe('Success Save Dummy Data', () => {
      const randomLetters =
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26));

      const postData = {
        name: 'joex' + randomLetters.toLowerCase(),
        gender: 'male',
        sleepRecord: { sleepHours: 1, date: '2024-04-10' },
      };

      it('Save Dummy Data and get Id', async () => {
        await request(app.getHttpServer()).post('/accounts').send(postData);
        const getRes = await request(app.getHttpServer())
          .get('/accounts?perPage=10&currentPage=1')
          .send();
        availableId = getRes.body.rows[0].id;
      });
    });
    describe('POST ERROR TESTING', () => {
      it('Error For no req body', async () => {
        const res = await request(app.getHttpServer())
          .post('/sleep-records')
          .send({});
        expect(res.status).toBe(400);
        const messages = res.body.message.split(',');
        expect(messages).toContainEqual('Sleep hours is required.');
        expect(messages).toContainEqual('AccountId is required.');
        expect(messages).toContainEqual('Date is required.');
        expect(res.body.error).toBe('Bad Request');
      });
    });

    describe('Wrong formatting and date test', () => {
      it('Valid Date Format Check', async () => {
        const postData = {
          sleepHours: 26,
          date: 'lk',
          accountId: 'popo',
        };
        const res = await request(app.getHttpServer())
          .post('/sleep-records')
          .send(postData);
        expect(res.status).toBe(400);
        const messages = res.body.message.split(',');
        expect(messages).toContainEqual(
          'Please enter a valid date in the YYYY-MM-DD format.',
        );
        expect(messages).toContainEqual('AccountId must be a valid number.');
        expect(messages).toContainEqual('Sleep hours cannot exceed 24 hours.');

        expect(res.body.error).toBe('Bad Request');
      });
      it('Future Date Check', async () => {
        const postData = {
          sleepHours: 0.5,
          date: '2028-05-06',
          accountId: availableId,
        };
        const res = await request(app.getHttpServer())
          .post('/sleep-records')
          .send(postData);
        expect(res.status).toBe(400);
        const messages = res.body.message.split(',');
        expect(messages).toContainEqual(
          'Please enter a date that is not in the future.',
        );
        expect(messages).toContainEqual('Sleep hours must be at least 1 hour.');
        expect(res.body.error).toBe('Bad Request');
      });
    });
    describe('Success Save Record', () => {
      it('Success Save Record', async () => {
        const prev_record = await request(app.getHttpServer()).get(
          '/sleep-records?perPage=10&currentPage=1',
        );
        const postData = {
          sleepHours: 1,
          date: '2024-04-06',
          accountId: prev_record.body.rows[0].accountId,
        };
        const res = await request(app.getHttpServer())
          .post('/sleep-records')
          .send(postData);

        expect(res.body.message).toEqual('New Record Saved');
      });
    });
    describe('Last Seven', () => {
      it('Success Save Record', async () => {
        // const prev_record = await request(app.getHttpServer()).get(
        //   '/sleep-records?perPage=10&currentPage=1',
        // );

        const res = await request(app.getHttpServer()).get(
          `/sleep-records/last-seven/${availableId}`,
        );
        expect(res.body).toEqual({
          rows: res.body.rows,
          count: res.body.count,
        });
        expect(res.status).toBe(200);
      });
    });
    describe('Get Single', () => {
      it('Success Save Record', async () => {
        const res = await request(app.getHttpServer()).get(
          `/sleep-records/${availableId}`,
        );
        expect(res.body).toEqual({ row: res.body.row });
        expect(res.status).toBe(200);
      });
    });

    describe('Update', () => {
      let availableId: number;
      it('Return Error if record not found', async () => {
        const id = 896565;
        const patchRes = await request(app.getHttpServer())
          .patch(`/sleep-records/${id}`)
          .send({ accountId: availableId, date: '2024-04-01', sleepHours: 1 });

        expect(patchRes.status).toBe(400);
        expect(patchRes.body.message).toEqual(`Record not found for id ${id}`);
      });
      it('Success Update', async () => {
        const getRes = await request(app.getHttpServer()).get(
          '/sleep-records?perPage=10&currentPage=1',
        );

        availableId = getRes.body.rows[0].id;
        const patchRes = await request(app.getHttpServer())
          .patch(`/sleep-records/${availableId}`)
          .send({ accountId: availableId, date: '2024-04-01', sleepHours: 1 });
        expect(patchRes.status).toBe(200);
        expect(patchRes.body).toEqual({
          message: `Sleep Record for ${availableId} updated successfully`,
          updatedRows: patchRes.body.updatedRows,
        });
      });
    });
    describe('delete', () => {
      const id = 896565;
      it('Return Error if record not found', async () => {
        const patchRes = await request(app.getHttpServer()).delete(
          `/sleep-records/${id}`,
        );
        expect(patchRes.status).toBe(404);
        expect(patchRes.body.message).toEqual(`Sleep record not found`);
      });
    });
  });
});
