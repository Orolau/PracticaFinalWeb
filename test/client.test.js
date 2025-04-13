const request = require("supertest");
const { app, server } = require("../app");
const mongoose = require("mongoose");
const { clientModel, userModel } = require('../models/index.js')
const { encrypt } = require('../utils/handlePassword.js')
const { tokenSign } = require('../utils/handleJwt.js');
const { Types } = require('mongoose');
const { findById } = require("../models/deliverynote.js");

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
        email: "guest@correo.com",
        password: "TestPassword123",
        user: "guest",
        company: {
            "cif": "661389225K",
            "name": "Mercadona",
            "street": "Gran Vía",
            "province": "Madrid",
            "number": 23,
            "postal": 2005,
            "city": "Madrid"
        }
    }

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
    },
    {
        name: "Client Test 2",
        cif: "987654321N",
        address: {
            "street": "Calle Fuencarral",
            "province": "Pontevedra",
            "number": 10,
            "postal": 36004,
            "city": "Pontevedra"
        }
    }

]
let token
let token2
let tokenGuest
let userId
let userId2
let userGuest
let clientId
let clientId2
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

    const body2 = initialUsesrs[1]
    body2.password = password
    body2.status = 1
    const userData2 = await userModel.create(body2)
    userData2.set("password", undefined, { strict: false })
    userId2 = userData2._id
    token2 = tokenSign(userData2, process.env.JWT_SECRET)

    const body3 = initialUsesrs[2]
    body3.password = password
    body3.status = 1
    const userData3 = await userModel.create(body3)
    userData2.set("password", undefined, { strict: false })
    userGuest = userData3._id
    tokenGuest = tokenSign(userData3, process.env.JWT_SECRET)

    const client1Body = initialClients[0]
    client1Body.userId = userId
    const clientData1 = await clientModel.create(client1Body)
    clientId = clientData1._id

    const client2Body = initialClients[1]
    client2Body.userId = userId
    const clientData2 = await clientModel.create(client2Body)
    clientId2 = clientData2._id

}, 7000);

describe("Client creation", () => {
    test("Should create a new client", async () => {
        const res = await request(app)
            .post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Client Test",
                cif: "123456789L",
                address: {
                    "street": "Calle Fuencarral",
                    "province": "Pontevedra",
                    "number": 10,
                    "postal": 36004,
                    "city": "Pontevedra"
                }
            });

        expect(res.statusCode).toBe(200);

    });
    test("Should fail trying to create a client that already exist", async () => {
        const res = await request(app)
            .post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Client Test 2",
                cif: "987654321N",
                address: {
                    "street": "Calle Fuencarral",
                    "province": "Pontevedra",
                    "number": 10,
                    "postal": 36004,
                    "city": "Pontevedra"
                }
            });

        expect(res.statusCode).toBe(409);
    });
    test("Should fail trying to create a client that already exist in the company", async () => {
        const res = await request(app)
            .post("/api/client")
            .set("Authorization", `Bearer ${tokenGuest}`)
            .send({
                name: "Client Test 2",
                cif: "987654321N",
                address: {
                    "street": "Calle Fuencarral",
                    "province": "Pontevedra",
                    "number": 10,
                    "postal": 36004,
                    "city": "Pontevedra"
                }
            });

        expect(res.statusCode).toBe(409);
    });
    test("Should fail trying to create a client without providing a token", async () => {
        const res = await request(app)
            .post("/api/client")
            .send({
                name: "Client Test 3",
                cif: "557654321R",
                address: {
                    "street": "Calle Fuencarral",
                    "province": "Pontevedra",
                    "number": 10,
                    "postal": 36004,
                    "city": "Pontevedra"
                }
            });

        expect(res.statusCode).toBe(401);
    });
    test("Should fail trying to create a client without providing required data", async () => {
        const res = await request(app)
            .post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.statusCode).toBe(422);
    });

});
describe("Getting the clients", () => {
    test("Should get all clients for the user and company", async () => {
        const res = await request(app)
            .get("/api/client")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Should get a client by ID", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
    test("Should get another company user's client by ID", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${tokenGuest}`);

        expect(res.statusCode).toBe(200);
    });
    test("Error trying to get a non-existent client", async () => {
        const fakeClientId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .get(`/api/client/${fakeClientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });
    test("Error trying to get a client without providing a valid id", async () => {
        const fakeClientId = "aaaaaaaaaaaaa aaaaaaaaaa"
        const res = await request(app)
            .get(`/api/client/${fakeClientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(422);
    });
    test("Error trying to get another user's client", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(403);
    });
});
describe("Client Modifications", () => {
    test("Should update the client", async () => {
        const res = await request(app)
            .patch(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                cif: "784562318U",
                address: {
                    "street": "Calle de Grau",
                    "province": "Barcelona",
                    "number": 11,
                    "postal": 67025,
                    "city": "Barcelona"
                }
            });

        expect(res.statusCode).toBe(200);
    });
    test("Should update another company user's client", async () => {
        const res = await request(app)
            .patch(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${tokenGuest}`)
            .send({
                cif: "784562318U",
                address: {
                    "street": "Calle de Grau",
                    "province": "Barcelona",
                    "number": 11,
                    "postal": 67025,
                    "city": "Barcelona"
                }
            });

        expect(res.statusCode).toBe(200);
    });
    test("Error trying to update a non-existent client", async () => {
        const fakeClientId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .patch(`/api/client/${fakeClientId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                cif: "784562318U",
                address: {
                    "street": "Calle de Grau",
                    "province": "Barcelona",
                    "number": 11,
                    "postal": 67025,
                    "city": "Barcelona"
                }
            });

        expect(res.statusCode).toBe(404);
    });
    test("Error trying to update a client without providing the token", async () => {
        const res = await request(app)
            .patch(`/api/client/${clientId}`)
            .send({
                cif: "784562318U",
                address: {
                    "street": "Calle de Grau",
                    "province": "Barcelona",
                    "number": 11,
                    "postal": 67025,
                    "city": "Barcelona"
                }
            });

        expect(res.statusCode).toBe(401);
    });
    test("Error trying to update another user's client", async () => {
        const res = await request(app)
            .patch(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${token2}`)
            .send({
                cif: "784562318U",
                address: {
                    "street": "Calle de Grau",
                    "province": "Barcelona",
                    "number": 11,
                    "postal": 67025,
                    "city": "Barcelona"
                }
            });

        expect(res.statusCode).toBe(403);
    });
});
describe("Delete and archive clients", () => {
    
    test("Error trying to archive another user's client", async () => {
        const res = await request(app)
            .delete(`/api/client/archive/${clientId2}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(403);
    });
    test("Error trying to archive a non-existing client", async () => {
        const fakeClientId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/client/archive/${fakeClientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });
    test("Error trying to archive a client with a invalid id", async () => {
        const fakeClientId = "aaaaaaaaaaa aaaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/client/archive/${fakeClientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(422);
    });

    test("Should list archived clients", async () => {

        const res = await request(app)
            .get("/api/client/archive")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    test("Should restore an archived client", async () => {
        const client = await clientModel.findById(clientId)
        await client.delete({_id: clientId})

        const res = await request(app)
            .patch(`/api/client/archive/${clientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Client restored successfully");
    });
    test("Should archive the client", async () => {
        const res = await request(app)
            .delete(`/api/client/archive/${clientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Client archived successfully");
    });
    
    test("Error trying to restore a non-deleted client", async () => {
        const res = await request(app)
            .patch(`/api/client/archive/${clientId2}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });

    test("Error trying to delete another user's client", async () => {
        const res = await request(app)
            .delete(`/api/client/${clientId2}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(403);
    });
    test("Should delete client permanently", async () => {
        const res = await request(app)
            .delete(`/api/client/${clientId2}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Client deleted successfully");
    });
    test("Error trying to delete a non-existing client", async () => {
        const fakeClientId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/client/${fakeClientId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(404);
    });
    test("Invalid id provided to delete a client", async () => {
        const fakeClientId = "aaaaaaaaaa aaaaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/client/${fakeClientId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(422);
    });
});

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});
