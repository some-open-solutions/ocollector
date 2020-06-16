function doGet(e){
  return saveData(e);
}

function doPost(e){
  return saveData(e);
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function saveData(e) {
  
  var response = e.parameter;
  
  var encrypted_data  = response.encrypted_data;  
  var experiment_id   = response.experiment_id;
  var participant_id  = response.participant_id;
  var completion_code = response.completion_code;
  var prehashed_code  = response.prehashed_code;
  
  var hashed_code     = prehashed_code.hashCode();
  
  var data_folder       = getOrCreateSubFolder('Data','Collector');
  var experiment_folder = getOrCreateSubFolder(experiment_id,'Data');
  
  updateFile(data_folder,experiment_id + "-" + participant_id + "-" + completion_code + ".txt", encrypted_data);  //keeping this until the next line has worked reliably for a while
  updateFile(experiment_folder, participant_id + "-" + completion_code + "-" + hashed_code + ".txt",encrypted_data);
}

//solution by Craig on https://stackoverflow.com/questions/14965442/how-to-delete-overwrite-csv-file-using-google-apps-script
function updateFile (folder, filename, data) {
  try {
    // filename is unique, so we can get first element of iterator
    var file = folder.getFilesByName(filename).next()
    file.setContent(data)
  } catch(e) {
    folder.createFile(filename, data)
  }
}

//solution by k4k4sh1 at https://stackoverflow.com/questions/48516036/how-to-check-if-a-folder-exists-in-a-parent-folder-using-app-script

function getOrCreateSubFolder(childFolderName, parentFolderName) {
  var parentFolder, parentFolders;
  var childFolder, childFolders;
  // Gets FolderIterator for parentFolder
  parentFolders = DriveApp.getFoldersByName(parentFolderName);
  /* Checks if FolderIterator has Folders with given name
  Assuming there's only a parentFolder with given name... */ 
  while (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  }
  // If parentFolder is not defined it sets it to root folder
  if (!parentFolder) { parentFolder = DriveApp.getRootFolder(); }
  // Gets FolderIterator for childFolder
  childFolders = parentFolder.getFoldersByName(childFolderName);
  /* Checks if FolderIterator has Folders with given name
  Assuming there's only a childFolder with given name... */ 
  while (childFolders.hasNext()) {
    childFolder = childFolders.next();
  }
  // If childFolder is not defined it creates it inside the parentFolder
  if (!childFolder) { parentFolder.createFolder(childFolderName); }
  return childFolder;
}