const express = require('express');
const fs = require('fs');
const hueColour = require('@q42philips/hue-color-converter');
const huejay = require('huejay');
const nconf = require('nconf');
const parseColour = require('color-parse');

const app = express();

nconf.file('./config.json');

// Live match API: https://api.overwatchleague.com/live-match?expand=team.content&locale=en-gb
// From https://api.overwatchleague.com/teams?expand=team.content&locale=en-gb
const teams = {
	dal: {
		name: 'Dallas Fuel',
		primaryColour: '032340',
		secondaryColour: '0072CE',
		tertiaryColour: '9EA2A2',
		logo: "https://bnetcmsus-a.akamaihd.net/cms/page_media/NO44N7DDJAPF1508792362936.png",
		icon: "https://bnetcmsus-a.akamaihd.net/cms/template_resource/YX6JZ6FR89LU1507822882865.svg"
	},
	phi: {
		name: 'Philadelphia Fusion',
		primaryColour: 'FF9E1B',
		// secondaryColour: '000000',
		secondaryColour: 'FFFFFF',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/3JZTLCPH37QD1508792362853.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/LAKZ6R7QEG6S1507822883033.svg'
	},
	hou: {
		name: 'Houston Outlaws',
		// primaryColour: '000000',
		primaryColour: '97D700',
		secondaryColour: 'FFFFFF',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/HLRHYU5MT9MD1508792362935.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/UPM8U5QV3DDU1507858876250.svg'
	},
	bos: {
		name: 'Boston Uprising',
		primaryColour: '174B97',
		secondaryColour: 'EFDF00',
		// tertiaryColour: '000000',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/43UINMGMA83X1513383982827.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/W4FGQ24HKCB51513383982827.svg'
	},
	nye: {
		name: 'New York Excelsior',
		primaryColour: '171C38',
		secondaryColour: '0F57EA',
		tertiaryColour: 'FF1C26',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/9r/9RYLM8FICLJ01508818792450.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/jz/JZHJUJ8QM1AP1508818097057.svg'
	},
	sfs: {
		name: 'San Francisco Shock',
		primaryColour: 'FC4C02',
		secondaryColour: '75787B',
		tertiaryColour: 'CAB64B',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/YO24NN5KAOFL1508792362791.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/0SY7LHKHV86R1507822883113.svg'
	},
	val: {
		name: 'Los Angeles Valiant',
		primaryColour: '4A7729',
		// secondaryColour: '000000',
		secondaryColour: 'D9C756',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/0D8BNUWVZP6B1508792362890.PNG',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/L3U59GQVS1ZK1507822882879.svg'
	},
	gla: {
		name: 'Los Angeles Gladiators',
		primaryColour: '3C1053',
		// secondaryColour: '000000',
		secondaryColour: 'FFFFFF',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/3AEMOZZL76PF1508792362892.PNG',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/CHTRRZCBEYGN1507822882862.svg'
	},
	fla: {
		name: 'Florida Mayhem',
		primaryColour: 'FEDB00',
		secondaryColour: 'AF272F',
		// tertiaryColour: '000000',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/4GO273NATVWM1508792362854.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/M1KNTZW8SGHZ1507822883041.svg'
	},
	shd: {
		name: 'Shanghai Dragons',
		primaryColour: 'D22630',
		// secondaryColour: '000000',
		secondaryColour: 'FCE300',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/B0R64QSNCDLX1508792362793.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/ZIVUVIWXNIFL1507822883114.svg'
	},
	seo: {
		name: 'Seoul Dynasty',
		primaryColour: 'AA8A00',
		// secondaryColour: '000000',
		secondaryColour: 'FFFFFF',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/LHRSIW3NWH211508792362796.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/E9MU0AK0JIXT1507858876249.svg'
	},
	ldn: {
		name: 'London Spitfire',
		primaryColour: 'FF8200',
		secondaryColour: '59CBE8',
		tertiaryColour: '1C2B39',
		logo: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/NW461AQIYQMK1508792363133.png',
		icon: 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/HCS229B4DP021507822883016.svg'
	}
};

huejay.discover()
	.then(bridges => {
		for (let bridge of bridges) {
			console.log(`Id: ${bridge.id}, IP: ${bridge.ip}`);
		}
	})
	.catch(error => {
		console.log(`An error occurred: ${error.message}`);
	});

const client = new huejay.Client({
	host: nconf.get('hue:bridge:host'),
	username: nconf.get('hue:bridge:username')
});

client.lights.getAll()
	.then(lights => {
		for (let light of lights) {
			console.log(`Light [${light.id}]: ${light.name}`);
			console.log(`  Type:             ${light.type}`);
			console.log(`  Unique ID:        ${light.uniqueId}`);
			console.log('  Model:');
			console.log(`    Id:             ${light.model.id}`);
			console.log(`    Name:           ${light.model.name}`);
			console.log(`    Type:           ${light.model.type}`);
			console.log(`	 Colour Mode:	 ${light.colorMode}`);
			console.log(`    Color Gamut:    ${light.model.colorGamut}`);
		}
	})
// const user = new client.users.User;
// 	user.deviceType = 'RainbowOWL';
// 	client.users.create(user)
// 		.then(user => {
// 			console.log(`New user created - Username: ${user.username}`);
// 		})
// 		.catch(error => {
// 			if(error instanceof huejay.Error && error.type === 101) {
// 				return console.log(`Link button not pressed, try again`);
// 			}
// 			console.log(error.stack);
// 		});

app.get('/teams', (request, response) => {
	response.json(teams);
});

app.get('/teams/:team', (request, response) => {
	if (teams[request.params.team]) {
		const activeLights = nconf.get('hue:lights');

		// TODO: Use groups instead
		activeLights.forEach(lightID => {
			client.lights.getById(lightID)
				.then(light => {
					const rgbValues = parseColour(`#${teams[request.params.team].primaryColour}`).values;
					const converted = hueColour.calculateXY(rgbValues[0], rgbValues[1], rgbValues[2], light.model.colorGamut);
					console.log(converted);
					light.on = true;
					light.brightness = 200;
					light.xy = [converted[0], converted[1]];

					return client.lights.save(light);
				});
		});

		response.json(teams[request.params.team]);
	} else {
		response.status(404).json('Could not find requested team');
	}
});

app.get('/match/:awayTeam/:homeTeam', (request, response) => {
	if (teams[request.params.awayTeam] && teams[request.params.homeTeam]) {
		// Actual implementation will split lights between two teams
		response.send(`Match between ${teams[request.params.awayTeam].name} and ${teams[request.params.homeTeam].name}`);
	} else {
		response.status(400).json('Could not find requested teams or malformed URL');
	}
});

app.get('/victory/:team', (request, response) => {
	if (teams[request.params.team]) {
		// Actual implementation will flash lights to team colours
		response.send(`${teams[request.params.team].name} won the match!`);
	} else {
		response.status(404).json('Could not find requested team');
	}
});

app.use(express.static('public'));

app.listen(3000, () => console.log('RainbowOWL listening on port 3000'));
