const request = require("supertest");
const {app,server} = require("../app");
const mongoose = require('mongoose');

describe("Auth & User Endpoints", () => {
  let token = "";
  let userId = "";

  test("Should register a new user", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        email: "testuser3@example.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
  });

  test("Should log in and return the token", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "testuser2@example.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
     token = res.body.token;
     userId = res.body.user._id;
  });

  test("Update user personal data", async () => {
    const res = await request(app)
      .patch(`/api/user/register`)
      .set("Authorization", `Bearer ${token}`)
      .send({ 
        name: "Updated Name",
        surnames: 'surnames',
        email: 'testuser2@example.com',
        nif: '123456789J'
     });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });
  test('Update user address', async () => {
    const res = await request(app).patch(`/api/user/address`).set('Authorization', `Bearer ${token}`).send({
      address: {
        street: 'Main St',
        city: 'Madrid',
        postal: '28001',
        number: 4,
        province: 'Madrid'
      }
    });
    expect(res.statusCode).toBe(200);
  });
  test('Update user company', async () => {
    const res = await request(app).patch(`/api/user/company`).set('Authorization', `Bearer ${token}`).send({
      company: {
        name: 'New Company',
        cif: '903456759A',
        street: 'Main St',
        city: 'Madrid',
        postal: '28001',
        number: 4,
        province: 'Madrid'
      }
    });
    expect(res.statusCode).toBe(200);
  });
  test('Get user data', async () => {
    const res = await request(app).get(`/api/user`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', userId);
  });

  test('Should create an account for a guest', async () => {
    const res = await request(app).post('/api/user/invite').set('Authorization', `Bearer ${token}`).send({
      email: 'inviteduser2@example.com',
      name: 'guest',
      surnames: 'guest surname',
      password: '2ecurePassword123'
    });
    expect(res.statusCode).toBe(200);
  });

  test('Recover token', async () => {
    const res = await request(app).post('/api/user/recover').send({
      email: 'testuser2@example.com'
    });
    expect(res.statusCode).toBe(200);
  });

//   test('Validate recovery code', async () => {
//     const res = await request(app).post('/auth/validate').send({
//       email: 'testuser@example.com',
//       code: '123456'
//     });
//     expect(res.statusCode).toBe(200);
//   });

  test('Change password', async () => {
    const res = await request(app).patch('/api/user/password').set("Authorization", `Bearer ${token}`).send({
      password: 'NewSecPassword123'
    });
    expect(res.statusCode).toBe(200);
  });

  test("The user must be set deleted=true in the database", async () => {
    const res = await request(app)
      .delete(`/api/user?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User soft deleted successfully");
  });
  // test("The user must be deleted from the database", async () => {
  //   const res = await request(app)
  //     .delete(`/api/user?soft=false`)
  //     .set("Authorization", `Bearer ${token}`);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.message).toBe("User hard deleted successfully");
  // });
 });
afterAll(async () => {
    server.close()
    await mongoose.connection.close()
});