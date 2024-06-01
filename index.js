const fs = require('fs')
const { config } = require('process')
const configFile = require('./config.json')

// list all directories in the directory servapps and compile them in servapps.json

const servapps = fs.readdirSync('./servapps').filter(file => fs.lstatSync(`./servapps/${file}`).isDirectory())

let servappsJSON = []
for (const file of servapps) {
  try {
    const servapp = JSON.parse(fs.readFileSync(`./servapps/${file}/description.json`));
    servapp.id = file;
    servapp.screenshots = [];
    servapp.artefacts = {};
    // list all screenshots in the directory servapps/${file}/screenshots
    if (fs.existsSync(`./servapps/${file}/screenshots`)) {
      const screenshots = fs.readdirSync(`./servapps/${file}/screenshots`);
      for (const screenshot of screenshots) {
        servapp.screenshots.push(`https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/screenshots/${screenshot}`);
      }
    }
    if (fs.existsSync(`./servapps/${file}/artefacts`)) {
      const artefacts = fs.readdirSync(`./servapps/${file}/artefacts`);
      for (const artefact of artefacts) {
        servapp.artefacts[artefact] = (`https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/artefacts/${artefact}`);
      }
    }
    //Cosmos Format
    const primaryIconSource = `https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/icon.png`;
    if (fs.existsSync(`./servapps/${file}/icon.png`)) {
      servapp.icon = primaryIconSource;
     }
    //TinyActive Format
    let alternativeIconSource = null;
    const alternativeIconPath = `https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/logo`;

    if (fs.existsSync(`./servapps/${file}/logo`)) {
      const pngFiles = fs.readdirSync(`./servapps/${file}/logo`);
      if (pngFiles.length > 0) {
      alternativeIconSource = `${alternativeIconPath}/${pngFiles[0]}`;
    }
      servapp.icon = alternativeIconSource;
  }
    //RunTipi Format
    const ThirdIconSource = `https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/metadata/logo.jpg`;
    if (fs.existsSync(`./servapps/${file}/metadata/logo.jpg`)) {
      servapp.icon = ThirdIconSource;
     }
     //Asteroid Format
    const FourthIconSource = `https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/logo.jpg`;
    if (fs.existsSync(`./servapps/${file}/logo.jpg`)) {
      servapp.icon = FourthIconSource;
     }
    //Common Format,used by most
    const primaryComposeSource =  `https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/docker-compose.yml`;
    if (fs.existsSync(`./servapps/${file}/docker-compose.yml`)) {
      servapp.compose = primaryComposeSource;
  }
    //Cosmos Legacy Format
    const alternativeComposeSource =  `https://lilkidsuave.github.io/cosmos-servapps-unofficial/servapps/${file}/cosmos-compose.json`;
    if (fs.existsSync(`./servapps/${file}/cosmos-compose.json`)) {
      servapp.compose = alternativeComposeSource;
  }
    servappsJSON.push(servapp)
  } catch (error) {
      if (error.message.includes('is not defined')) {
      console.error(`Error loading description.json for ${file}: Skipping`);
      continue;
    } else {
      console.error(`Unknown Error`, error.message);
      continue;
    }
  }
}

// add showcase
const _sc = ["Jellyfin", "Home Assistant", "Nextcloud"];
const showcases = servappsJSON.filter((app) => _sc.includes(app.name));

let apps = {
  "source": configFile.url,
  "showcase": showcases,
  "all": servappsJSON
}

fs.writeFileSync('./servapps.json', JSON.stringify(servappsJSON, null, 2))
fs.writeFileSync('./index.json', JSON.stringify(apps, null, 2))

for (const servapp of servappsJSON) {
  servapp.compose = `http://localhost:3000/servapps/${servapp.id}/docker-compose.yml`
  servapp.icon = `http://localhost:3000/servapps/${servapp.id}/icon.png`
  for (let i = 0; i < servapp.screenshots.length; i++) {
    servapp.screenshots[i] = servapp.screenshots[i].replace('https://lilkidsuave.github.io/cosmos-servapps-unofficial', 'http://localhost:3000')
  }
  for (const artefact in servapp.artefacts) {
    servapp.artefacts[artefact] = servapp.artefacts[artefact].replace('https://lilkidsuave.github.io/cosmos-servapps-unofficial', 'http://localhost:3000')
  }
}

fs.writeFileSync('./servapps_test.json', JSON.stringify(apps, null, 2))
