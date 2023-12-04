function doGet() {
    return HtmlService.createHtmlOutputFromFile('index');
  }
  
  function uploadImage(e) {
    var folder = DriveApp.getFolderById('18ABCi0a3-97AQwRKTphCn8Bb2XL8OuRO');
    var imageBlob = e.imageFile.getBlob();
    var fileName = 'uploadedImage_' + new Date().getTime(); // Create a unique filename
  
    // Check the content type of the image
    var contentType = imageBlob.getContentType();
  
    if (contentType === 'image/png' || contentType === 'image/jpeg') {
      // If the content type is PNG or JPEG, create the corresponding file
      folder.createFile(imageBlob.setName(fileName));
      return 'File uploaded successfully!';
    } else {
      // If the content type is not supported, return an error message
      return 'Unsupported file type. Please upload PNG or JPEG images.';
    }
  }
  