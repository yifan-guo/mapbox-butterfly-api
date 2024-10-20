'use strict';

const fs = require('fs');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const constants = require('../src/constants');

async function init() {
  if (fs.existsSync(constants.DB_PATH)) {
    fs.unlinkSync(constants.DB_PATH);
  }

  const db = await lowdb(new FileAsync(constants.DB_PATH));

  await db.defaults({
    butterflies: [
      { id: 'Hq4Rk_vOPMehRX2ar6LKX', commonName: 'Zebra Swallowtail', species: 'Protographium marcellus', article: 'https://en.wikipedia.org/wiki/Protographium_marcellus' },
      { id: 'H7hhcEWLDsxyHN0cnDrBV', commonName: 'Plum Judy', species: 'Abisara echerius', article: 'https://en.wikipedia.org/wiki/Abisara_echerius' },
      { id: 'VJ5v4ZEQVL92XaaSl7xgD', commonName: 'Red Pierrot', species: 'Talicada nyseus', article: 'https://en.wikipedia.org/wiki/Talicada_nyseus' },
      { id: 'juX-MCpw0NUW1xh40xgVc', commonName: 'Texan Crescentspot', species: 'Anthanassa texana', article: 'https://en.wikipedia.org/wiki/Anthanassa_texana' },
      { id: 'HIoGrnyIiUeIvAyhaYpit', commonName: 'Guava Skipper', species: 'Phocides polybius', article: 'https://en.wikipedia.org/wiki/Phocides_polybius' },
      { id: 'HlvjJBL8BLw2HFETsr9Sv', commonName: 'Mexican Bluewing', species: 'Myscelia ethusa', article: 'https://en.wikipedia.org/wiki/Myscelia_ethusa' }
    ],
    users: [
      { id: '-9aAFuyNIkpSzRMNux2BQ', username: 'iluvbutterflies' },
      { id: '15rKqk4vDp7V5vE1MYG3t', username: 'flutterby' },
      { id: '2rWtjZcs88ElPfRSSL3Zm', username: 'metamorphosize_me' }
    ]
  }).write();
}

if (require.main === module) {
  (async () => await init())();
}
