const request = require("supertest");
const { app, server } = require("../app");
const mongoose = require("mongoose");
const { clientModel, userModel, projectModel, deliverynoteModel } = require('../models/index.js')
const { encrypt } = require('../utils/handlePassword.js')
const { tokenSign } = require('../utils/handleJwt.js');
const { Readable } = require("stream");

const initialUsesrs = [
    {
        email: "prueba@correo.com",
        password: "TestPassword123",
        company: {
            "cif": "661389225K",
            "name": "Mercadona",
            "street": "Gran Vía",
            "province": "Madrid",
            "number": 23,
            "postal": 2005,
            "city": "Madrid"
        }
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
    },
    {
        email: "invitado@correo.com",
        password: "TestPassword123",
        role: "guest",
        company: {
            "cif": "661389225K",
            "name": "Mercadona",
            "street": "Gran Vía",
            "province": "Madrid",
            "number": 23,
            "postal": 2005,
            "city": "Madrid"
        }
    },

]
const initialClients = [
    {
        name: "InitialClient",
        cif: "784562318U",
        address: {
            "street": "Calle Fuencarral",
            "province": "Pontevedra",
            "number": 10,
            "postal": 36004,
            "city": "Pontevedra"
        }
    }

];
const initialProjects = [
    {
        name: "Proyecto de Prueba",
        projectCode: "TEST001",
        code: "001",
        address: {
            "street": "Calle Fuencarral",
            "province": "Pontevedra",
            "number": 10,
            "postal": 36004,
            "city": "Pontevedra"
        }
    }
]
const initialDeliveryNote = [
  {
    format: "material",
    materials: "stone - 5Kg",
    description: "This is a example of a material delivery note",
    workerDate: "02-03-2026",

  },
  {
    format: "hours",
    materials: "1 worker - 5h",
    description: "This is a example of a hours delivery note",
    workerDate: "02-03-2026",

  }
]


let token
let token2
let tokenGuest
let userId
let clientId
let projectId
let deliverynoteId
let deliverynoteId2
beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await userModel.deleteMany({})
    await clientModel.deleteMany({})
    const password = await encrypt(initialUsesrs[0].password)
    const body = initialUsesrs[0]
    body.password = password
    body.status = 1
    const userData = await userModel.create(body)
    userData.set("password", undefined, { strict: false })

    token = tokenSign(userData, process.env.JWT_SECRET)
    userId = userData._id

    const body3 = initialUsesrs[2]
    body3.password = password
    body3.status = 1
    const userData3 = await userModel.create(body3)
    userData3.set("password", undefined, { strict: false })

    tokenGuest = tokenSign(userData3, process.env.JWT_SECRET)

    const body2 = initialUsesrs[1]
    body2.password = password
    body2.status = 1
    const userData2 = await userModel.create(body2)
    userData2.set("password", undefined, { strict: false })
    token2 = tokenSign(userData2, process.env.JWT_SECRET)

    const client1Body = initialClients[0]
    client1Body.userId = userId
    const clientData1 = await clientModel.create(client1Body)
    clientId = clientData1._id

    const projectBody1 = initialProjects[0]
    projectBody1.clientId = clientId
    projectBody1.userId = userId
    const projectData1 = await projectModel.create(projectBody1)
    projectId = projectData1._id

    const deliveryNoteBody = initialDeliveryNote[0]
    deliveryNoteBody.clientId = clientId
    deliveryNoteBody.userId = userId
    deliveryNoteBody.projectId = projectId
    const deliverynoteData = await deliverynoteModel.create(deliveryNoteBody)
    deliverynoteId = deliverynoteData._id

    const deliveryNoteBody2 = initialDeliveryNote[1]
    deliveryNoteBody2.clientId = clientId
    deliveryNoteBody2.userId = userId
    deliveryNoteBody2.projectId = projectId
    const deliverynoteData2 = await deliverynoteModel.create(deliveryNoteBody2)
    deliverynoteId2 = deliverynoteData2._id

}, 7000);
describe("DeliveryNote API", () => {

    test("Should create a deliverynote (format: hours, hours type: String)", async () => {
      const res = await request(app)
        .post("/api/deliverynote")
        .set("Authorization", `Bearer ${token}`)
        .send({
          format: "hours",
          clientId,
          projectId,
          hours: "Trabajador 1 - 8h",
          date: "2025-04-10",
          description: "Desc"
        });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id");
    });
    test("Should create a deliverynote (format: hours, hours type: array)", async () => {
        const res = await request(app)
          .post("/api/deliverynote")
          .set("Authorization", `Bearer ${token}`)
          .send({
            format: "hours",
            clientId,
            projectId,
            hours: ["Trabajador 1 - 8h", "Trabajador 2 - 30h"],
            date: "2025-04-10",
          description: "Desc"
          });
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id");
      });
  
    test("Should create a deliverynote (format: material, material type: array)", async () => {
      const res = await request(app)
        .post("/api/deliverynote")
        .set("Authorization", `Bearer ${token}`)
        .send({
          format: "material",
          clientId,
          projectId,
          materials: ["Cemento - 10kg", "Piedra - 15kg"],
          date: "2025-04-11",
          description: "Desc"
        });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id");
    });
    test("Should create a deliverynote (format: material, material type: String)", async () => {
        const res = await request(app)
          .post("/api/deliverynote")
          .set("Authorization", `Bearer ${token}`)
          .send({
            format: "material",
            clientId,
            projectId,
            materials: "Cemento - 10kg",
            workdate: "2025-04-11",
          description: "Desc"
          });
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id");
      });
    test("Error creating deliverynote with missing data", async () => {
        const res = await request(app)
          .post("/api/deliverynote")
          .set("Authorization", `Bearer ${token}`)
          .send({});
    
        expect(res.statusCode).toBe(422);
      });
});

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};


describe("PDF DeliveryNotes", () => {
  test("generate and download a delivery note pdf", async () => {
    const res = await request(app)
      .get(`/api/deliverynote/pdf/${deliverynoteId}`)
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
  });
    
  
  test("Should sign (upload de image to ipfs) and generate a pdf", async () => {
    const fakeFileBuffer = Buffer.from("firma-png");
  
    const res = await request(app)
      .patch(`/api/deliverynote/sign/${deliverynoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", bufferToStream(fakeFileBuffer), {
        filename: "test-image.png",
        contentType: "image/png"
      });
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("pdf");
    expect(res.body).toHaveProperty("sign");
  });
  test("Error trying to upload the sign without providing a existing delivery note id", async () => {
    const fakeFileBuffer = Buffer.from("firma-png");
    const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa"
  
    const res = await request(app)
      .patch(`/api/deliverynote/sign/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", bufferToStream(fakeFileBuffer), {
        filename: "test-image.png",
        contentType: "image/png"
      });
  
    expect(res.statusCode).toBe(404);
  });
  test("Error trying to upload the sign without providing a valid id", async () => {
    const fakeFileBuffer = Buffer.from("firma-png");
    const fakeId = "aaaaaaaaaaaa aaaaaaaaaaa"
  
    const res = await request(app)
      .patch(`/api/deliverynote/sign/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", bufferToStream(fakeFileBuffer), {
        filename: "test-image.png",
        contentType: "image/png"
      });
  
    expect(res.statusCode).toBe(422);
  });
  test("Error trying to upload the sign to another user's delivery note", async () => {
    const fakeFileBuffer = Buffer.from("firma-png");
  
    const res = await request(app)
      .patch(`/api/deliverynote/sign/${deliverynoteId}`)
      .set("Authorization", `Bearer ${token2}`)
      .attach("image", bufferToStream(fakeFileBuffer), {
        filename: "test-image.png",
        contentType: "image/png"
      });
  
    expect(res.statusCode).toBe(403);
  });

})

describe("Getting DeliveryNotes", () => {
  
    test("Should get all deliverynotes for user", async () => {
      const res = await request(app)
        .get("/api/deliverynote")
        .set("Authorization", `Bearer ${token}`);
  
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  
    test("Should get deliverynotes for full company", async () => {
      const res = await request(app)
        .get("/api/deliverynote?company=true")
        .set("Authorization", `Bearer ${token}`);
  
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  
    test("Should get a deliverynote by ID", async () => {
      const res = await request(app)
        .get(`/api/deliverynote/${deliverynoteId}`)
        .set("Authorization", `Bearer ${token}`);
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id");
    });
    test("Should get another company member's deliverynote by ID", async () => {
        
        const res = await request(app)
          .get(`/api/deliverynote/${deliverynoteId}`)
          .set("Authorization", `Bearer ${tokenGuest}`);
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id");
      });

    test("Error getting deliverynotes without token", async () => {
      const res = await request(app)
        .get("/api/deliverynote");
  
      expect(res.statusCode).toBe(401);
    });

    test("Error trying to get another user's deliverynote by ID", async () => {
        const res = await request(app)
          .get(`/api/deliverynote/${deliverynoteId}`)
          .set("Authorization", `Bearer ${token2}`);
    
        expect(res.statusCode).toBe(403)
    });
    test("Error trying to get a non-existing deliverynote", async () => {
        const faketId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
          .get(`/api/deliverynote/${faketId}`)
          .set("Authorization", `Bearer ${token}`);
    
        expect(res.statusCode).toBe(404)
    });
    test("Error trying to get a deliverynote providing a invalid id", async () => {
        const faketId = "aaaaaaaaaaa aaaaaaaaaaaa"
        const res = await request(app)
          .get(`/api/deliverynote/${faketId}`)
          .set("Authorization", `Bearer ${token}`);
    
        expect(res.statusCode).toBe(422)
    });
  
});

describe("Getting DeliveryNotes", () => {
  test("Error trying to delete a delivery note providing a invalid id", async () => {
    const faketId = "aaaaaaaaaaa aaaaaaaaaaaa"
    const res = await request(app)
      .delete(`/api/deliverynote/${faketId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(422)
});
  test("Error trying to delete a non-existing delivery note", async () => {
    const faketId = "aaaaaaaaaaaaaaaaaaaaaaaa"
    const res = await request(app)
      .delete(`/api/deliverynote/${faketId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404)
});
  test("Error trying to delete a signed delivery note", async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliverynoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(405);
  });
  test("Error trying to delete another user's delivery note", async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliverynoteId2}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.statusCode).toBe(403);
  });
  test("Should delete a non-signed delivery note", async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliverynoteId2}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Delivery note deleted successfully')
  });
})

  
afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});