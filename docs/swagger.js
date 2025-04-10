const swaggerJsdoc = require("swagger-jsdoc");
const deliverynote = require("../models/deliverynote");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Digitalización de albaranes - Express API with Swagger (OpenAPI 3.0)",
      version: "0.1.0",
      description:
        "This is a CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "u-tad",
        url: "https://u-tad.com",
        email: "laura.alvarez@live.u-tad.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3006",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer"
        },
      },
      schemas: {
        user: {
          type: "object",
          required: ["name", "_id", "email", "role"],
          properties: {
            name: {
              type: "string",
              example: "Menganito"
            },
            _id: {
              type: "string",
              example: "67e7bd3cca24ba8647af227d"
            },
            email: {
              type: "string",
              example: "miemail@google.com"
            },
            role: {
              type: "string",
              example: "user"
            },
          },
        },
        email: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              example: "miemail@google.com"
            },
          }
        },
        password: {
          type: "object",
          required: ["password"],
          properties: {
            password: {
              type: "string",
              example: "newPassword123"
            },
          }
        },
        validateCode: {
          type: "object",
          required: ["email", "code"],
          properties: {
            email: {
              type: "string",
              example: "miemail@google.com"
            },
            code: {
              type: "string",
              example: "000000"
            },
          }
        },
        userRecoverToken: {
          type: "object",
          required: ["status", "_id", "email", "role"],
          properties: {
            status: {
              type: "integer",
              example: 1
            },
            _id: {
              type: "string",
              example: "67e7bd3cca24ba8647af227d"
            },
            email: {
              type: "string",
              example: "miemail@google.com"
            },
            role: {
              type: "string",
              example: "user"
            },
          },
        },
        userData: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsIn..."
            },
            user: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "Menganito"
                },
                _id: {
                  type: "string",
                  example: "67e7bd3cca24ba8647af227d"
                },
                email: {
                  type: "string",
                  example: "miemail@google.com"
                },
                role: {
                  type: "string",
                  example: "user"
                },
              },
            }
          }

        },
        code: {
          type: "object",
          required: ["code"],
          properties: {
            code: {
              type: "string",
              example: "000000"
            }
          }
        },
        userDataWithToken: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsIn..."
            },
            user: {
              type: "object",
              properties: {
                status: {
                  type: "integer",
                  example: 1
                },
                _id: {
                  type: "string",
                  example: "67e7bd3cca24ba8647af227d"
                },
                email: {
                  type: "string",
                  example: "miemail@google.com"
                },
                role: {
                  type: "string",
                  example: "user"
                },
              },
            }
          }

        },
        personalDataUser: {
          type: "object",
          required: ["name", "nif", "email", "surnames"],
          properties: {
            name: {
              type: "string",
              example: "Menganito"
            },
            nif: {
              type: "string",
              example: "12345678A"
            },
            email: {
              type: "string",
              example: "miemail@google.com"
            },
            surnames: {
              type: "string",
              example: "García Pérez"
            },
          },
        },
        guestDataRegister: {
          type: "object",
          required: ["email", "password", "name", "surnames"],
          properties: {
            email: {
              type: "string",
              example: "miemail@google.com"
            },
            password: {
              type: "string"
            },
            name: {
              type: "string",
              example: "Menganito"
            },
            surnames: {
              type: "string",
              example: "García Pérez"
            },
          }
        },
        userDataLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "miemail@google.com"
            },
            password: {
              type: "string",
              example: "newPassword123"
            },
          }
        },
        userAllData: {
          type: "object",
          required: ["_id", "email", "verificationAttempts", "code", "role", "status", "name", "surnames", "nif", "deleted", "createdAt", "updatedAt"],
          properties: {
            _id: {
              type: "string",
              example: "67e7bd3cca24ba8647af227d"
            },
            email: {
              type: "string",
              example: "ejemplo@gmail.com"
            },
            verificationAttempts: {
              type: "integer",
              example: 3
            },
            code: {
              type: "string",
              example: "678490"
            },
            role: {
              type: "string",
              example: "user"
            },
            status: {
              type: "integer",
              example: 1
            },
            name: {
              type: "string",
              example: "Laura"
            },
            surnames: {
              type: "string",
              example: ""
            },
            nif: {
              type: "string",
              example: "785421693K"
            },
            deleted: {
              type: "boolean",
              example: false
            },
            createdAt: {
              type: "string",
              example: "2025-03-29T09:28:28.639+00:00"
            },
            updatedAt: {
              type: "string",
              example: "2025-04-02T15:27:01.075+00:00"
            },
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "Las Rozas"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "12345"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                },
              }
            },
            url: {
              type: "string",
              example: "https://maroon-quick-catfish-709.mypinata.cloud/ipfs/QmcNWtD43kfVJ3Eu1…"
            },
            company: {
              type: "object",
              properties: {
                cif: {
                  type: "string",
                  example: "741342963L"
                },
                name: {
                  type: "string",
                  example: "u-tad"
                },
                street: {
                  type: "string",
                  example: "Gran Vía"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "111111"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                }
              }
            }
          }
        },
        userAddress: {
          type: "object",
          required: ["address"],

          properties: {
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "Las Rozas"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "12345"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                },
              }
            }
          }
        },
        userCompany: {
          type: "object",
          required: ["company"],

          properties: {
            company: {
              type: "object",
              properties: {
                cif: {
                  type: "string",
                  example: "741342963L"
                },
                name: {
                  type: "string",
                  example: "u-tad"
                },
                street: {
                  type: "string",
                  example: "Gran Vía"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "111111"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                }
              }
            }

          }
        },
        clientData: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              example: "U-tad"
            },
            cif: {
              type: "string",
              example: "123456789L"
            },
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "Las Rozas"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "12345"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                },
              }
            }
          }
        },
        allClientData: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              example: "U-tad"
            },
            cif: {
              type: "string",
              example: "123456789L"
            },
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "Las Rozas"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "12345"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                },
              }
            },
            _id: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            },
            logo: {
              type: "string",
              example: "https://inmofotos.es/wp-content/uploads/2021/10/foto-retrato-de-como-hacer-buenas-fotos-a-personas-628x628.jpg"
            },
            userId: {
              type: "string",
              example: "6661d631b3456d765e39af78"
            },
            createdAt: {
              type: "string",
              example: "2024-06-07T06:29:23.473Z"
            },
            updatedAt: {
              type: "string",
              example: "2024-06-07T06:29:23.473Z"
            }
          }
        },
        projectData: {
          type: "object",
          required: ["name", "projectCode", "clientId"],
          properties: {
            name: {
              type: "string",
              example: "U-tad"
            },
            projectCode: {
              type: "string",
              example: "YN-0098"
            },
            code: {
              type: "string",
              example: "0001"
            },
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "Las Rozas"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "12345"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                },
              }
            },
            clientId: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            }
          }
        },
        allProjectData: {
          type: "object",
          required: ["name", "projectCode", "clientId", "userId"],
          properties: {
            name: {
              type: "string",
              example: "U-tad"
            },
            projectCode: {
              type: "string",
              example: "YN-0098"
            },
            code: {
              type: "string",
              example: "0001"
            },
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "Las Rozas"
                },
                province: {
                  type: "string",
                  example: "Madrid"
                },
                number: {
                  type: "integer",
                  example: 3
                },
                postal: {
                  type: "string",
                  example: "12345"
                },
                city: {
                  type: "string",
                  example: "Madrid"
                },
              }
            },
            _id: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            },
            userId: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            },
            clientId: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            },
            begin: {
              type: "string",
              example: "2023-06-07"
            },
            end: {
              type: "string",
              example: "2025-07-17"
            },
            notes: {
              type: "string",
              example: "XXX XXX XXX"
            },
            createdAt: {
              type: "string",
              example: "2024-06-07T06:29:23.473Z"
            },
            updatedAt: {
              type: "string",
              example: "2024-06-07T06:29:23.473Z"
            }
          }
        },
        deliverynote: {
          type: "object",
          required: ["clientId", "projectId", "description"],
          properties: {
            description: {
              type: "string",
              example: "This is a description for a delivery note"
            },
            projectId: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            },
            clientId: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            },
            workdate: {
              type: "string",
              example: "2025-07-17"
            },
            format: {
              type: "string",
              example: "hours or material"
            },
            materials: {
              type: "array",
              example: "['paper', 'cement', 'stone']"
            },
            hours: {
              type: "array",
              example: "['4', '5', '6']"
            }
          }
        },
        deliverynoteAllData: {
          type: "object",
          required: ["clientId", "projectId", "description"],
          properties: {
            _id: {
              type: "string",
              example: "6662a8c3c199795c88329e4e"
            },
            description: {
              type: "string",
              example: "This is a description for a delivery note"
            },
            projectId: {
              $ref: "#/components/schemas/allProjectData"

            },
            userId: {
              $ref: "#/components/schemas/userAllData"
            },
            clientId: {
              $ref: "#/components/schemas/allClientData"

            },
            pdf: {
              type: "string",
              example: "https://gateway.pinata.cloud/ipfs/QmcQiVc3ayi9aZFmEiFEwp3gvi1fyoYugdvE1iEsbnvtPy"
            },
            sign: {
              type: "string",
              example: "https://maroon-quick-catfish-709.mypinata.cloud/ipfs/QmXXx8xDeTvKTyGxzp57cBgkhKp3VAYKyDWyrsAgPpiddb"
            },
            workdate: {
              type: "string",
              example: "2025-07-17"
            },
            format: {
              type: "string",
              example: "hours or material"
            },
            pending: {
              type: "bool",
              example: "false"
            },
            materials: {
              type: "array",
              example: "['paper', 'cement', 'stone']"
            },
            hours: {
              type: "array",
              example: "['4', '5', '6']"
            },
            createdAt: {
              type: "string",
              example: "2024-06-07T06:29:23.473Z"
            },
            updatedAt: {
              type: "string",
              example: "2024-06-07T06:29:23.473Z"
            }
          },

        },
      },
    }
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options)