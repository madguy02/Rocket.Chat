Accounts.registerLoginHandler('totp', function(options) {
	if (!options.totp || !options.totp.code) {
		return;
	}

	return Accounts._runLoginHandlers(this, options.totp.login);
});

RocketChat.callbacks.add('onValidateLogin', (login) => {
	if (!RocketChat.settings.get('Accounts_TwoFactorAuthentication_Enabled')) {
		return;
	}

	if (login.type === 'password' && login.user.services && login.user.services.totp && login.user.services.totp.enabled === true) {
		const { totp } = login.methodArguments[0];

		if (!totp || !totp.code) {
			throw new Meteor.Error('totp-required', 'TOTP Required');
		}

		const verified = RocketChat.TOTP.verify({
			secret: login.user.services.totp.secret,
			token: totp.code,
			userId: login.user._id,
			backupTokens: login.user.services.totp.hashedBackup
		});

		if (verified !== true) {
			throw new Meteor.Error('totp-invalid', 'TOTP Invalid');
		}
	}
});
