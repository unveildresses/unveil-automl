async function automlVisionPredict() {
   const automl = require('@google-cloud/automl').v1beta1;
   const fs = require('fs');
   const _ = require('lodash');

   // Create client for prediction service.
   const client = new automl.PredictionServiceClient();

   const projectId = 'unveil-platform';
   const computeRegion = 'us-central1';
   const modelId = 'ICN5153142718548934656';
   const directory = "/Users/stephanie/unveil/dress-data-sets/kleinfeld2";
   const scoreThreshold = '.5';
   // Get the full path of the model.
   const modelFullId = client.modelPath(projectId, computeRegion, modelId);

   fs.readdir(directory, (err, items) => {
     if(err) {
       console.log(err);
       return;
     }
     _.forEach(items, item => {
       // Read the file content for prediction.
       const content = fs.readFileSync(`${directory}/${item}`, 'base64');

       const params = {};

       if (scoreThreshold) {
         params.score_threshold = scoreThreshold;
       }

       // Set the payload by giving the content and type of the file.
       const payload = {};
       payload.image = {imageBytes: content};

       // params is additional domain-specific parameters.
       // currently there is no additional parameters supported.
       client.predict({
         name: modelFullId,
         payload: payload,
         params: params,
       }).then((res) =>{
         const arr = _.first(res);
         const payload = _.get(arr, "payload",[]);
         const result = _.first(payload);
         if(!result) return;
         console.log(`${item}: ${result.displayName} ${result.classification.score}`);
       }).catch(err=>console.log(err));
     });
   });
 }

 automlVisionPredict().catch(console.error);
