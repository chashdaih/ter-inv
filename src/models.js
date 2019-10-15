import { alcaldias } from '@/constants.js';

let supervisor = {
    name: '',
    lastName: '',
    mothersName: '',
    userType: 2,
    accountNum: ''
};

let therapist = {
    name: '',
    lastName: '',
    mothersName: '',
    phone1: '',
    phone2: '',
    officeAddress: '',
    estado: 'CDMX',
    officeAlcaldia: alcaldias[0],
    officeMunicipio: null,
    officeHours: '',
    maxCap: null,
    specs: '',
    target: {},
    attentionType: {},
    orientation: {},
    symptoms: {},
    degree: '',
    colPatients: true,
    refPatients: true,
    userType: 3
};

export { supervisor, therapist };