const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../src/app');

describe('API de autenticação', () => {

    let token;

    it('não deve autenticar usuário existente com senha inválida', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'tatiane', password: '#12435' });
        expect(res.status).to.equal(401);
        expect(res.body).to.have.property('error');
    });

    it('deve autenticar usuário válido e retornar o token', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'tatiane', password: '4321' });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token');
        token = res.body.token;
    });

    it('não deve autenticar usuário não existente com senha inválida', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'Roberto', password: '647683@' });
        expect(res.status).to.equal(401);
        expect(res.body).to.have.property('error');
    });

    it('não deve autenticar usuário não existente com senha válida', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'Sofia', password: '4321' });
        expect(res.status).to.equal(401);
        expect(res.body).to.have.property('error');
    });

    it('deve acessar rota protegida com token válido', async () => {
        const res = await request(app)
            .get('/protegido')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('mensagem');
    });

    it('não deve acessar rota protegida sem token', async () => {
        const res = await request(app)
            .get('/protegido');
        expect(res.status).to.equal(401);
        expect(res.body).to.have.property('error');
    });

    it('não deve acessar rota protegida com token inválido', async () => {
        const res = await request(app)
            .get('/protegido')
            .set('Authorization', 'Bearer token_invalido');
        expect(res.status).to.equal(403);
        expect(res.body).to.have.property('error');
    });
});
