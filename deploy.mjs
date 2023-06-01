import ftp from 'basic-ftp';
import logUpdate from 'log-update';
import getenv from 'getenv';
example();

async function example() {
  const client = new ftp.Client();
  let last = '';
  client.trackProgress((info) => {
    // console.log('File', info.name);
    // console.log('Type', info.type);
    // console.log('Transferred', info.bytes);
    // console.log('Transferred Overall', info.bytesOverall);
    if (last !== info.name) {
      logUpdate.done();
      last = info.name;
    }
    logUpdate(`File ${info.name},  Bytes ${info.bytes}, Total ${info.bytesOverall},`);
  });
  // client.ftp.verbose = true;
  try {
    await client.access({
      host: 'ftp.stedwardsfellwalkers.co.uk',
      user: 'vscode@stedwardsfellwalkers.co.uk',
      password: getenv('FTPPASSWORD'),
      secure: true,
      port: 21,
      secureOptions: { servername: 'orange.ukhost4u.com' },
    });
    await client.ensureDir('/public_html/bookings');
    console.log(await client.pwd());
    // await client.uploadFrom('database.sqlite', 'database.sqlite');
    // await client.uploadFrom('.env', '.env');
    // await client.uploadFrom('package.json', 'package.json');
    await client.uploadFromDir('public/build', 'build');
    // await client.uploadFromDir('models', 'models');
    // await client.rename('index.js', 'index0.js');
    // console.log(await client.list());
  } catch (err) {
    console.log(err);
  }
  client.close();
}
