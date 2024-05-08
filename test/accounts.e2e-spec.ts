import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // const dataSource = app.get(DataSource);
    // const entities = dataSource.entityMetadatas;
    // for (const entity of entities) {
    //   const repository = dataSource.getRepository(entity.name);
    //   await repository.query(
    //     `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    //   );
    //   'ALL DATA DELETED FROM' + entity.tableName;
    // }
    // await dataSource.createQueryBuilder().delete().from(Account).execute();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  describe('Save', () => {
    it('Error For no req body', async () => {
      const res = await request(app.getHttpServer()).post('/accounts').send({});
      expect(res.status).toBe(400);
      const messages = res.body.message.split(',');
      expect(messages).toContainEqual('Account name is required.');
      expect(messages).toContainEqual('Gender is required.');
      expect(messages).toContainEqual('Sleep record required');
      expect(res.body.error).toBe('Bad Request');
    });
    it('Error For no sleepRecord keys are required', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts')
        .send({ sleepRecord: {} });
      expect(res.status).toBe(400);
      const messages = res.body.message.split(',');
      expect(messages).toContainEqual('Sleep hours is required.');
      expect(messages).toContainEqual('Date is required.');

      expect(res.body.error).toBe('Bad Request');
    });
  });

  describe('Wrong formatting test and date test', () => {
    it('Error For no req body', async () => {
      const postData = {
        name: '8/*',
        gender: 'lk',
        sleepRecord: { sleepHours: '1', date: '20-05-205' },
      };
      const res = await request(app.getHttpServer())
        .post('/accounts')
        .send(postData);
      expect(res.status).toBe(400);
      const messages = res.body.message.split(',');
      expect(messages).toContainEqual('Account name should be alphabet');
      expect(messages).toContainEqual(
        'Gender must be either male female or other.',
      );
      expect(messages).toContainEqual('Date must be a valid date. YYYY-MM-DD');
      expect(res.body.error).toBe('Bad Request');
    });
    it('No Future Date Error', async () => {
      const postData = {
        name: 'joe',
        gender: 'male',
        sleepRecord: {
          sleepHours: 2,
          date: '2026-05-05',
        },
      };
      const res = await request(app.getHttpServer())
        .post('/accounts')
        .send(postData);
      expect(res.status).toBe(400);
      const messages = res.body.message.split(',');
      messages;
      expect(messages).toContainEqual('Date cannot be in the future.');
      expect(res.body.error).toBe('Bad Request');
    });
  });
  describe('Success Save Record', () => {
    const randomLetters =
      String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
      String.fromCharCode(65 + Math.floor(Math.random() * 26));

    const postData = {
      name: 'joex' + randomLetters.toLowerCase(),
      gender: 'male',
      sleepRecord: { sleepHours: 1, date: '2024-04-10' },
    };
    it('Success Save Record', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts')
        .send(postData);

      expect(res.body).toEqual({
        message: 'New Record Saved',
        data: {
          name: postData.name,
          gender: postData.gender,
          sleepRecord: [
            {
              id: expect.any(Number),
              date: postData.sleepRecord.date,
              sleepHours: postData.sleepRecord.sleepHours,
              accountId: expect.any(Number),
            },
          ],
          id: expect.any(Number),
        },
      });
    });
    it('Update if same name is entered', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts')
        .send(postData);

      expect(res.body.message).toEqual(
        `Record Updated For User ${postData.name}`,
      );
    });
    it('Error If previous+ current hours are greater than 24', async () => {
      const data = {
        name: postData.name,
        gender: 'male',
        sleepRecord: { sleepHours: 23, date: '2024-04-10' },
      };
      const res = await request(app.getHttpServer())
        .post('/accounts')
        .send(data);

      expect(res.body.message).toEqual(
        `Sleep Hours can not be more than 24 hours`,
      );
      expect(res.body.error).toEqual(`Bad Request`);
      expect(res.status).toBe(400);
    });
  });
  describe('Get All', () => {
    it('Success Save Record', async () => {
      const res = await request(app.getHttpServer()).get(
        '/accounts?perPage=10&currentPage=1',
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
      const res = await request(app.getHttpServer()).get('/accounts/1');

      expect(res.body).toEqual({ row: res.body.row });
      expect(res.status).toBe(200);
    });
  });

  describe('Update', () => {
    let availableId: number;
    it('Return Error if record not found', async () => {
      const id = 896565;
      const patchRes = await request(app.getHttpServer())
        .patch(`/accounts/${id}`)
        .send({ gender: 'male' });

      expect(patchRes.status).toBe(400);
      expect(patchRes.body.message).toEqual(`Record not found for id ${id}`);
    });
    it('Success Update', async () => {
      const getRes = await request(app.getHttpServer())
        .get('/accounts?perPage=10&currentPage=1')
        .send();
      availableId = getRes.body.rows[0].id;
      const patchRes = await request(app.getHttpServer())
        .patch(`/accounts/${availableId}`)
        .send({ gender: 'male' });
      expect(patchRes.status).toBe(200);
      expect(patchRes.body).toEqual({
        message: `Account ${availableId} updated successfully`,
        record: patchRes.body.record,
      });
    });
  });
  describe('delete', () => {
    const id = 896565;
    it('Return Error if record not found', async () => {
      const patchRes = await request(app.getHttpServer()).delete(
        `/accounts/${id}`,
      );
      expect(patchRes.status).toBe(404);
      expect(patchRes.body.message).toEqual(`Account record not found`);
    });
  });
});
