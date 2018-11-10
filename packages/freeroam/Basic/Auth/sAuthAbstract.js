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
            text: `Hallo! Dein Verifizierungscode lautet: ${code}`,
            html: `<b>Hallo!</b><br>Dein Verifizierungscode lautet: ${code}`,
        }
        mailer.sendMail(mail);
        player.call("cInjectCef", [`app.showInfo('Bitte siehe in dein E-Mail Postfach nach!');`]);
    }

    hashPassword(str) {
        const cipher = crypto.createCipher('aes192', '08sf7g907s6g976f79s6ggß8g');
        let encrypted = cipher.update(str, 'utf8', 'hex'); 
        encrypted += cipher.final('hex');
        return encrypted;
    }

    canCheckCode(player) {
        if (player.verificationCodeTries < 5) return true;
        this.showError(player, `Zu viele Fehlversuche bei der Codeeingabe`);
        player.loggedIn = false;
        misc.log.warn(`${player.socialClub} Zu viele Fehlversuche bei der Codeeingabe`);
        player.kick('Du hast zu viele fehlversuche bei der Codeeingabe.');
        return false;
    }

    checkCode(player, code) {
        if (!this.canCheckCode(player)) return false;
        if (player.verificationCode !== code) {
            player.verificationCodeTries++;
            this.showError(player, `Falscher Code!`);
            return false;
        }
        return true;
    }
}
module.exports = AbstractAuth;