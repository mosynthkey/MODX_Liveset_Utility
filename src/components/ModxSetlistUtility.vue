<template>
<div id='ModxLivesetUtility'>
  <h1>MODX LIVESET Utility</h1>
  <input type="file" @change="uploadFile"/>
</div>
</template>

<script>
import Utility from "../modx_liveset_utility"
import { Buffer } from 'buffer';

export default {
  name: 'ModxLivesetUtility',
  setup() {
    let utility = new Utility.ModxLivesetUtility();
    
    const uploadFile = (file) => {
      const fileObject = file.target.files[0];
      
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(fileObject);
      fileReader.onload = () => {
        utility.setX8ADataBuffer(Buffer.from(fileReader.result));
        utility.print();
      };
    };

    return { uploadFile };
  }
}
</script>

<style>
</style>