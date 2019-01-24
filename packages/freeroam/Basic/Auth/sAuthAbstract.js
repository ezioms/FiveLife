const crypto = require('crypto');
const misc = require('../../misc');
const mailer = require('../../mailer');

class AbstractAuth {
    showError(player, text) {
        player.call("cInjectCef", [`app.showError('${text}');`]);
    }

    sendCode(player, email) {
        const code = misc.getRandomInt(100, 999);
        player.verificationCode = code;
        player.verificationDate = new Date().getTime();
        player.verificationCodeTries = 0;
        const mail = {
            from: `${mailer.getMailAdress()}`,
            to: `${email}`,
            subject: `Verification code: ${code}`,
            text: `Bonjour! Votre code de vérification est: ${code}`,
            html: `<b>Bonjour!</b><br>Votre code de vérification est: ${code}`,
        }
        mailer.sendMail(mail);
        player.call("cInjectCef", [`app.showInfo('S il vous plaît voir votre boîte de réception e mail!');`]);
    }

    hashPassword(str) {
        const cipher = crypto.createCipher('aes192', '08sf7g907s6g976f79s6ggß8g');
        let encrypted = cipher.update(str, 'utf8', 'hex'); 
        encrypted += cipher.final('hex');
        return encrypted;
    }

    canCheckCode(player) {
        if (player.verificationCodeTries < 5) return true;
        this.showError(player, `Trop de tentatives infructueuses de saisie de code`);
        player.loggedIn = false;
        misc.log.warn(`${player.socialClub} Trop de tentatives infructueuses de saisie de code`);
        player.kick('Vous avez trop d erreurs dans la saisie du code.');
        return false;
    }

    checkCode(player, code) {
        if (!this.canCheckCode(player)) return false;
        if (player.verificationCode !== code) {
            player.verificationCodeTries++;
            this.showError(player, `Mauvais code!`);
            return false;
        }
        return true;
    }
}
module.exports = AbstractAuth;
