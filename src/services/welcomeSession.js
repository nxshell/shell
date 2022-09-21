import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";

class WelcomeSession extends SessionInterface {
    constructor() {
        super("Welcome", SESSION_TYPES.WELCOME)
    }
}

function createWelcomeSession() {
    return new WelcomeSession();
}


registerSessionFactory(SESSION_TYPES.WELCOME, createWelcomeSession);
