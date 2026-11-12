export async function launchBrowser(chromium){
  let last;
  for(let attempt=0;attempt<3;attempt++){
    try{return await chromium.launch({executablePath:process.env.PICPAC_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});}
    catch(error){last=error;if(!/spawn EPERM|has been closed|3221225781|3221225477/.test(error.message))throw error;}
  }
  throw last;
}

