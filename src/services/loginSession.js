import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";

class LoginSession extends SessionInterface {
    constructor() {
        super("Login", SESSION_TYPES.LOGIN)
    }
}

function createLoginSession() {
    return new LoginSession();
}


registerSessionFactory(SESSION_TYPES.LOGIN, createLoginSession);
