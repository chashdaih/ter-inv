import { required, confirmed, min, email } from "vee-validate/dist/rules";
import { extend, localize } from "vee-validate";
import es from 'vee-validate/dist/locale/es.json';

extend("required", required);

extend("email", email);

extend("confirmed", confirmed);

extend("min", min);

localize('es', es);