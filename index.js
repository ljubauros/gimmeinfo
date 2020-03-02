const axios = require('axios');
const fs = require('fs');
const diff = require('diff');
const nodemailer = require('nodemailer');

fs.readFile('pages.json', (err, data) => {
	if(err) throw err;
	let pages = JSON.parse(data);
	for (let i = 0; i < pages.length; i++) {
		axios.get(pages[i].url)
			.then(response => {
				if(response.data == pages[i].data){
					return;
				}else{
					let changes = diff.diffWordsWithSpace(response.data, pages[i].data);
					let text = "";
					changes.forEach(part => {
						text += part.added ? `\n----- added ----- \n ${part.value}` : '';
						text += part.removed ? `\n----- removed ----- \n ${part.value}` : '';
					});
					let subject = "IZMENA - " + pages[i].name;
					sendMail(subject, text);
					pages[i].data = response.data;
					fs.writeFile('pages.json', JSON.stringify(pages, null, '\t'), (err) => {
						if(err) throw err;
					});
				}
			})
			.catch(error => console.log(error));
		
	}
});

function sendMail(subject, text) {
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'asd@gmail.com',
			pass: 'pwd'
		}
	});

	mailOptions = {
		from: 'asd@gmail.com',
		to: 'asd@gmail.com',
		subject: subject,
		text: text
	};

	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	}); 
}

function addPage(name, url) {
	let pages = [];
	fs.readFile('pages.json', (err, data) => {
		if(err) throw err;
		pages = JSON.parse(data);
		let exists = 0;
		pages.forEach(page => {
			if(page.url == url) exists = 1;
		});
		if(!exists){
			axios.get(url)
			.then(response => {
				pages.push({'name' : name, 'url' : url, 'data' : response.data})
				fs.writeFile('pages.json', JSON.stringify(pages, null, '\t'), (err) => {
					if(err) throw err;
				})
			})
			.catch(error => console.log(error));
		}else{
			console.log("page exists");
		}
	});
}