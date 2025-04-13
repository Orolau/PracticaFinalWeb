const request = require("supertest");
const { app, server } = require("../app");
const mongoose = require("mongoose");
const { clientModel, userModel, projectModel } = require('../models/index.js')
const { encrypt } = require('../utils/handlePassword.js')
const { tokenSign } = require('../utils/handleJwt.js');

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
    },
    {
        name: "Proyecto de Prueba 2",
        projectCode: "TEST002",
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

let token
let token2
let tokenGuest
let userId
let userId2
let clientId
let clientId2
let projectId
let projectId2
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
    userId2 = userData2._id
    token2 = tokenSign(userData2, process.env.JWT_SECRET)

    const client1Body = initialClients[0]
    client1Body.userId = userId
    const clientData1 = await clientModel.create(client1Body)
    clientId = clientData1._id

    const client2Body = initialClients[1]
    client2Body.userId = userId
    const clientData2 = await clientModel.create(client2Body)
    clientId2 = clientData2._id

    const projectBody1 = initialProjects[0]
    projectBody1.clientId = clientId
    projectBody1.userId = userId
    const projectData1 = await projectModel.create(projectBody1)
    projectId = projectData1._id

    const projectBody2 = initialProjects[1]
    projectBody2.clientId = clientId
    projectBody2.userId = userId
    const projectData2 = await projectModel.create(projectBody2)
    projectId2 = projectData2._id

}, 7000);

describe("Create Projects", () => {

    test("Should create a new project", async () => {
        const res = await request(app)
            .post("/api/project")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto de Prueba Nuevo",
                projectCode: "TEST003",
                clientId: clientId,
                code: "001",
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
    test("Error trying to create a project that already exists", async () => {
        const res = await request(app)
            .post("/api/project")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto de Prueba Nuevo",
                projectCode: "TEST001",
                clientId: clientId,
                code: "001",
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
    test("Error trying to creare a project with the same name or code of another project existing in the company", async () => {
        const res = await request(app)
            .post("/api/project")
            .set("Authorization", `Bearer ${tokenGuest}`)
            .send({
                name: "Proyecto de Prueba Nuevo",
                projectCode: "TEST001",
                clientId: clientId,
                code: "001",
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
    test("Error trying to creare a project without providing the required data", async () => {
        const res = await request(app)
            .post("/api/project")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.statusCode).toBe(422);
    });
})
describe("Getting Project Data", () => {
    test("Should get all projects for the user and company", async () => {
        const res = await request(app)
            .get("/api/project")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
    test("Error trying to get projects without providing a token", async () => {
        const res = await request(app)
            .get("/api/project")
            
        expect(res.statusCode).toBe(401);
    });

    test("Should get a project by ID", async () => {
        const res = await request(app)
            .get(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id");

    });
    test("Should get another company user's project by ID", async () => {
        const res = await request(app)
            .get(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${tokenGuest}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id");
    });
    test("Error trying to get a non-existing project", async () => {
        const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .get(`/api/project/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });
    test("Error trying to get a project but providing a not valid id", async () => {
        const fakeId = "aaaaaaaaaaa aaaaaaaaaaaa"
        const res = await request(app)
            .get(`/api/project/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(422);
    });
    test("Error trying to get another user's project", async () => {
        const res = await request(app)
            .get(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(403);
    });
})
describe("Updating projects", () => {
    test("Should update the project", async () => {
        const res = await request(app)
            .put(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto Actualizado",
                projectCode: "TEST001",
                clientId: clientId,
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Proyecto Actualizado");
    });
    test("Should update another company user's project", async () => {
        const res = await request(app)
            .put(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${tokenGuest}`)
            .send({
                name: "Proyecto Actualizado 2.0",
                projectCode: "TEST001",
                clientId: clientId,
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Proyecto Actualizado 2.0");
    });
    test("Error trying to change a project name and projectCode that already exist", async () => {
        const res = await request(app)
            .put(`/api/project/${projectId2}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto Actualizado",
                projectCode: "TEST001",
                clientId: clientId,
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(409);
    });
    test("Error trying to change a non-existing project", async () => {
        const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .put(`/api/project/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto Actualizado",
                projectCode: "TEST001",
                clientId: clientId,
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(404)
    });
    test("Error trying to change a project providing a invalid id", async () => {
        const fakeId = "aaaaaaaaaa aaaaaaaaaaaaa"
        const res = await request(app)
            .put(`/api/project/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto Actualizado",
                projectCode: "TEST001",
                clientId: clientId,
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(422)
    });
    test("Error trying to change another user's project", async () => {
        const res = await request(app)
            .put(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token2}`)
            .send({
                name: "Proyecto Actualizado",
                projectCode: "TEST001",
                clientId: clientId,
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(403);
    });
    test("Error trying to change a project without providing required data", async () => {
        const res = await request(app)
            .put(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token2}`)
            .send({
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(422);
    });
})

describe("Archiving and deleting projects", () => {
    test("Error trying to archive another user's project", async () => {
        const res = await request(app)
            .delete(`/api/project/archive/${projectId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(403);
    });
    test("Error trying to archive a project without providing a valid id", async () => {
        const fakeId = "aaaaaaaaaa aaaaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/project/archive/${fakeId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(422);
    });
    test("Error trying to archive a non-existing project", async () => {
        const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/project/archive/${fakeId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(404);
    });
    test("Should restore the archived project", async () => {
        const project = await projectModel.findById(projectId)
        await project.delete({_id: projectId})
        const res = await request(app)
            .patch(`/api/project/archive/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Project restored successfully");
    });
    test("Should archive the project", async () => {
        const res = await request(app)
            .delete(`/api/project/archive/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Project archived successfully");
    });

    test("Should list archived projects", async () => {
        const project = await projectModel.findById(projectId)
        if(project)
            await project.delete({_id: projectId})
        const res = await request(app)
            .get("/api/project/archive")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.some(project => project._id == projectId)).toBe(true);
    });

    test("Error trying to delete another user's project", async () => {
        const res = await request(app)
            .delete(`/api/project/${projectId2}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(403);
    });
    test("Error trying to delete a non-existing project", async () => {
        const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/project/${fakeId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(404);
    });
    test("Error trying to delete a non-existing project", async () => {
        const fakeId = "aaaaaaaaaaaa aaaaaaaaaaa"
        const res = await request(app)
            .delete(`/api/project/${fakeId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(422);
    });

    test("Should delete the project permanently", async () => {
        const res = await request(app)
            .delete(`/api/project/${projectId2}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Project deleted successfully");
    });
});

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});
