const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
// const cors = require('cors')({origin: true});

admin.initializeApp();

let mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'papdadmo@gmail.com',
        pass: 'melaniefigueroa',
    },
});

// Sends email when a therapist gets a new reference
// exports.sendEmailNewReference = functions.firestore.document('/refers/{uid}').onCreate(async (snap, context) => {
//     // const newValue = change.after.data();
//     // const previousValue = change.before.data();

//     // if (!newValue.patients) return null;

//     // if (newValue.patients.length === previousValue.patients.length) {
//     //     return null;
//     // }
//     const uid = snap.data().therapistId;

//     const user = await admin.auth().getUser(uid)
//     const userEmail = user.toJSON().email;

//     const mailOptions = {
//         from: '"Terapeuta Invitado", <noreply@firebase.com>', // todo: revisar por que esto no hace nada :/
//         to: userEmail,
//     };

//     // Building email message
//     mailOptions.subject = "Se te ha referido un nuevo usuario";
//     mailOptions.text = 
//     `Hola.
//     Un nuevo usuario ha sido referido contigo.
//     Por favor, entra a la plataforma para ver su información.
        
//     Atte. El equipo de terapeuta invitado.`;

//     try {
//         await mailTransport.sendMail(mailOptions);
//         console.log('mail enviado');
//     } catch (error) {
//         console.error('Hubo un error', error);
//     }
//     return null;
// });

exports.sendNewRefEmail = functions.https.onCall(async data => {

    const therapist = await admin.auth().getUser(data.therapistId);
    const therapistMail = therapist.toJSON().email;

    const mailOptions = {
        to: therapistMail,
        subject: "Notificación de nuevo paciente",
        text: `
        ¡Hola!.
        Se le ha referenciado un nuevo usuario.

        Por favor, entre a la plataforma para más información.
        `,
    };
    
    try {
        await mailTransport.sendMail(mailOptions);
        console.log('mail enviado');
    } catch (error) {
        console.error('Hubo un error', error);
    }
    return null;
});

// exports.toggleUserStatus = functions.firestore.document('/users/{uid}').onUpdate(async (change, context) => {
//     const newValue = change.after.data();
//     if (newValue.disabled !== null) {
//         await admin.auth().updateUser(context.params.uid, {
//             disabled: newValue.disabled,
//         });
//     } 
//     return null;
// });

exports.createNewUser = functions.https.onCall(data => {

    console.log('-------------')

    const email = data.email;
    const password = data.password
    const uid = data.uid;

    return admin.auth().createUser({email, password, uid})
    .then(user => {
        return {uid: user.uid};
    })
    .catch(error => {
        throw new functions.https.HttpsError("invalid-argument", error.message);
    });
    
});

exports.changePassword = functions.https.onCall(data => {
    const uid = data.uid;
    const password = data.password;
    return admin.auth().updateUser(uid, { password })
    .then(userRecord => userRecord.toJSON())
    .catch(error => {
        throw new functions.https.HttpsError("invalid-argument", error.message);
    });
})

exports.deleteUser = functions.https.onCall(async data => {
    const uid = data.uid;

    try {
        await admin.auth().deleteUser(uid);
        return {ok:200}
    } catch (error) {
        throw new functions.https.HttpsError("invalid-argument", error.message);
    }

})