const request = require("supertest");
const { app, server } = require("../app.js");
const mongoose = require('mongoose');
const { encrypt } = require('../utils/handlePassword.js')
const { tokenSign } = require('../utils/handleJwt.js');
const { userModel } = require('../models/index.js')
const { Readable } = require("stream");

const initialUsesrs = [
  {
    email: "prueba@correo.com",
    password: "TestPassword123"
  },
  {
    email: "prueba2@correo.com",
    password: "TestPassword123",
    company: {
      "cif": "741342963L",
      "name": "u-tad",
      "street": "Gran Vía",
      "province": "Pontevedra",
      "number": 3,
      "postal": 36885,
      "city": "Vigo"
    }
  }

]
let token
let token2
let userId
beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await userModel.deleteMany({})
  const code = "111111"
  const password = await encrypt(initialUsesrs[0].password)
  const body = initialUsesrs[0]
  body.password = password
  body.code = code
  const userData = await userModel.create(body)
  userData.set("password", undefined, { strict: false })

  token = tokenSign(userData, process.env.JWT_SECRET)
  userId = userData._id

  const body2 = initialUsesrs[1]
  body2.password = password
  body2.code = code
  const userData2 =await userModel.create(body2)
  userData2.set("password", undefined, { strict: false })

  token2 = tokenSign(userData2, process.env.JWT_SECRET)
}, 7000);

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

describe("User Registration", () => {
  test("Should register a new user", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        email: "testuser@example.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
  });
  test("Should fail to register a new user that already exist", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        email: "testuser@example.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(409);
  });
  test("Should fail to register a new user that already exist", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        email: "testuser2@example.com",
        password: "pass"
      });
    expect(res.statusCode).toBe(422);
  });
  test('Should create an account for a guest', async () => {
    const res = await request(app).post('/api/user/invite').set('Authorization', `Bearer ${token}`).send({
      email: 'inviteduser@example.com',
      name: 'guest',
      surnames: 'guest surname',
      password: '2ecurePassword123'
    });
    expect(res.statusCode).toBe(200);
  });
  test('Should fail creating the guest account: user exist', async () => {
    const res = await request(app).post('/api/user/invite').set('Authorization', `Bearer ${token}`).send({
      email: 'prueba2@correo.com',
      name: 'guest',
      surnames: 'guest surname',
      password: '2ecurePassword123'
    });
    expect(res.statusCode).toBe(409);
  });
})
describe("User Account Verification", () => {
  test('Should validate the code from the database', async () => {
    const user = await userModel.findOne({ email: "prueba@correo.com" });
    expect(user).not.toBeNull();


    const res = await request(app)
      .put('/api/user/validation')
      .set("Authorization", `Bearer ${token}`)
      .send({ code: user.code });

    expect(res.statusCode).toBe(200);
  });
  test('Should fail with invalid code', async () => {
    const res = await request(app)
      .put('/api/user/validation')
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "000000" });

    expect(res.statusCode).toBe(400);
  });

})
describe("Log In", () => {
  test("Should log in and return the token", async () => {
    const user = await userModel.findOne({ email: "prueba@correo.com" });
    user.status = 1;
    await user.save();
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "prueba@correo.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
  test("Should not log in: password incorrect", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "prueba@correo.com",
        password: "noPassword"
      });
    expect(res.statusCode).toBe(400);
  });
  test("Should return an error of a missing parameter", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "prueba@correo.com"
      });
    expect(res.statusCode).toBe(422);
  });
  test("Should not find the user account", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "usuarioInventado@example.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(404);
  });
  test("Should fail because user is not validated", async () => {
    const user = await userModel.findOne({ email: "prueba@correo.com" });
    user.status = 0;
    await user.save();

    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "usuarioInventado@example.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(404);
    user.status = 1;
    await user.save()
  });
  test("Should fail due to no atemps left", async () => {
    const user = await userModel.findOne({ email: "prueba@correo.com" });
    user.veryficationAtemps = 0;
    await user.save();

    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "usuarioInventado@example.com",
        password: "TestPassword123"
      });
    expect(res.statusCode).toBe(404);
    user.veryficationAtemps = 3;
    await user.save();
  });

})
describe("Profile Updates", () => {
  test("Update user personal data", async () => {
    const res = await request(app)
      .patch(`/api/user/register`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Name",
        surnames: 'surnames',
        email: 'prueba@correo.com',
        nif: '123456789J'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });
  test("Fail to update: no token", async () => {
    const res = await request(app)
      .patch(`/api/user/register`)
      .send({
        name: "Updated Name",
        surnames: 'surnames',
        email: 'prueba@correo.com',
        nif: '123456789J'
      });
    expect(res.statusCode).toBe(401);
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
  test('Fail to update user address: address not provided', async () => {
    const res = await request(app).patch(`/api/user/address`).set('Authorization', `Bearer ${token}`).send({

    });
    expect(res.statusCode).toBe(422);
  });
  test('Update user company', async () => {
    const res = await request(app).patch(`/api/user/company`).set('Authorization', `Bearer ${token}`).send({
      company: {
        name: 'New Company',
        cif: '323556784G',
        street: 'Main St',
        city: 'Madrid',
        postal: '28001',
        number: 4,
        province: 'Madrid'
      }
    });
    expect(res.statusCode).toBe(200);
  });
  test('Fail to update user company: company cif already asociated to another company', async () => {
    const res = await request(app).patch(`/api/user/company`).set('Authorization', `Bearer ${token}`).send({
      company: {
        name: 'New Company',
        cif: '741342963L',
        street: 'Main St',
        city: 'Madrid',
        postal: '28001',
        number: 4,
        province: 'Madrid'
      }
    });
    expect(res.statusCode).toBe(409);
  });
})
describe("Get data, recovey and change password", () => {
  test('Get user data', async () => {
    const res = await request(app).get(`/api/user`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
  test('Fail getting user data: token not provided', async () => {
    const res = await request(app).get(`/api/user`);
    expect(res.statusCode).toBe(401);
  });


  test('Recover token', async () => {
    const res = await request(app).post('/api/user/recover').send({
      email: 'prueba@correo.com'
    });
    expect(res.statusCode).toBe(200);
  });
  test('Fail to recover token for a non-existing user', async () => {
    const res = await request(app).post('/api/user/recover').send({
      email: 'inventedUser@example.com'
    });
    expect(res.statusCode).toBe(404);
  });
  test('Validate recovery code', async () => {
    const user = await userModel.findOne({ email: "prueba@correo.com" });
    
    const res = await request(app).post('/api/user/validation').send({
      email: 'prueba@correo.com',
      code: user.code
    });
    expect(res.statusCode).toBe(200);
  });
  test('Fail to validate recovery code: incorrect code', async () => {
    const user = await userModel.findOne({ email: "prueba@correo.com" });
    user.code = '111111';
    await user.save();
    const res = await request(app).post('/api/user/validation').send({
      email: 'prueba@correo.com',
      code: '000000'
    });
    expect(res.statusCode).toBe(401);
  });
  test('Fail to validate recovery code: user does not exist', async () => {
    
    const res = await request(app).post('/api/user/validation').send({
      email: 'inventedUser@correo.com',
      code: '000000'
    });
    expect(res.statusCode).toBe(404);
  });

  test('Change password', async () => {
    const res = await request(app).patch('/api/user/password').set("Authorization", `Bearer ${token}`).send({
      password: 'NewSecPassword123'
    });
    expect(res.statusCode).toBe(200);
  });
  test('Fail to change password: no password provided', async () => {
    const res = await request(app).patch('/api/user/password').set("Authorization", `Bearer ${token}`).send({
      
    });
    expect(res.statusCode).toBe(422);
  });
});


describe("Upload images to ipfs", () => {

test('Upload profile logo', async () => {
  const fakeFileBuffer = Buffer.from("firma-png");
  const res = await request(app)
    .patch('/api/user/logo')
    .set("Authorization", `Bearer ${token}`)
    .attach("image", bufferToStream(fakeFileBuffer), {
      filename: "test-image.png",
      contentType: "image/png"
    });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("url");
});
})

describe("Soft and hard delete users", () => {
  test("The user must be set deleted=true in the database", async () => {
    const res = await request(app)
      .delete(`/api/user?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User soft deleted successfully");

  });
  test("The user must be deleted from the database", async () => {
    const res = await request(app)
      .delete(`/api/user?soft=false`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User hard deleted successfully");
  });
  test("User can not be deleted: user not found", async () => {
    const res = await request(app)
      .delete(`/api/user?soft=false`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.statusCode).toBe(404);
  });

});
afterAll(async () => {
  server.close()
  await mongoose.connection.close()
});