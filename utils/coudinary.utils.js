
//cloudinary
const cloudinary= require('cloudinary')
cloudinary.config({
    cloud_name:'dhl5zkpym',
    api_key:'639143938394633',
    api_secret:'3NnTEYJhq7wlXaM80GyaoSrQlFs',
    secure:true
})


async function uploadimg(file, path) {
  try {
    let files = file?file:false
    let paths = path?path:false
    
    if (files!=false && paths!=false) {
        
        let upload =await cloudinary.v2.uploader.upload(files.tempFilePath,{resource_type:'image',folder:paths,use_filename:false,unique_filename:true})
        return {url:upload.secure_url, publicID:upload.public_id}
    }
    return {error:'Images are missing'}
  } catch (error) {
    console.log(error);
    return {error:error.message}
  }
}

async function uploadVideo(file, path) {
    try {
      let files = file?file:false
      let paths = path?path:false
      if (files!=false && paths!=false) {
          
          let upload =await cloudinary.v2.uploader.upload(files.tempFilePath,{resource_type:'video',folder:paths,use_filename:false,unique_filename:true})
          return {url:upload.secure_url, publicID:upload.public_id}
      }
      return {error:'Images are missing'}
    } catch (error) {
      console.log(error);
      return {error:error.message}
    }
}

async function uploadRaw(file, path, toppingName) {
    try {
      let files = file?file:false
      let paths = path?path:false
      if (files!=false && paths!=false) {
          
          let upload =await cloudinary.v2.uploader.upload(files.tempFilePath,{resource_type:'raw',folder:paths,filename_override:toppingName+files.name})
          return {url:upload.secure_url, publicID:upload.public_id}
      }
      return {error:'File is missing'}
    } catch (error) {
      console.log(error);
      return {error:error.message}
    }
}

async function deleteFile(publicIDs){
    try {
        let publicID= publicIDs?publicIDs:false
        console.log(publicID);
    if (publicID!=false) {
        await cloudinary.v2.uploader.destroy(publicID)  
        return {deleted:true}  
    }
    return {error:'no file like this'}
    } catch (error) {
        console.log(error);
    return {error:error.message}
        
    }
}

async function deleteBulkFile(publicIDs){
    try {
        let publicID= publicIDs.length>0?publicIDs:false
        console.log(publicID);
    if (publicID!=false) {
        for (let i = 0; i < publicID.length; i++) {
            // const element = publicID[i];
            await cloudinary.v2.uploader.destroy(publicID[i])
        }
          
        return {deleted:true}  
    }
    return {error:'no public Ids'}
    } catch (error) {
        console.log(error);
    return {error:error.message}
        
    }
}

async function deleteImg(publicIDs){
    try {
        let publicID= publicIDs?publicIDs:false
        console.log(publicID);
    if (publicID!=false) {
        await cloudinary.v2.uploader.destroy(publicID)  
        return {deleted:true}  
    }
    return {error:'no file like this'}
    } catch (error) {
        console.log(error);
    return {error:error.message}
        
    }
}

async function deleteBulkImg(publicIDs){
    try {
        let publicID= publicIDs.length>0?publicIDs:false
        console.log(publicID);
    if (publicID!=false) {
        for (let i = 0; i < publicID.length; i++) {
            // const element = publicID[i];
            await cloudinary.v2.uploader.destroy(publicID[i])
        }
          
        return {deleted:true}  
    }
    return {error:'no public Ids'}
    } catch (error) {
        console.log(error);
    return {error:error.message}
        
    }
}

async function addpdf(file) {
    try {
        let files = file?file:false
        if (files!=false && paths!=false) {
            let upload =await cloudinary.v2.uploader.upload(files.tempFilePath,{resource_type:'image',folder:process.env.notes,use_filename:false,unique_filename:true})
            return {url:upload.secure_url, publicID:upload.public_id}
        }
        return {error:'file not found'}
      } catch (error) {
        console.log(error);
        return {error:error.message}
      }
}

async function uploadMultipleImages(files, path) {
    try {
      if (!files || files.length === 0 || !path) {
        return { error: 'Images or path are missing' };
      }
  
      const uploadPromises = files.map(async (file) => {
        const upload = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          resource_type: 'image',
          folder: path,
          use_filename: false,
          unique_filename: true,
        });
  
        return { url: upload.secure_url, publicID: upload.public_id };
      });
  
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.log(error);
      return { error: error };
    }
}


module.exports={uploadimg, uploadVideo, uploadRaw, deleteFile, deleteBulkFile, deleteImg , deleteBulkImg, addpdf, uploadMultipleImages}
