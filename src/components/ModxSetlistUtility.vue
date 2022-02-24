<template> 
    <div id="q-app">
        <q-layout class="shadow-2 rounded-borders">
            <q-header>
                <q-toolbar>
                    <q-btn flat round dense icon="menu" class="q-mr-sm" ></q-btn>
        
                    <q-toolbar-title>MODX LIVESET Utility</q-toolbar-title>

                    <q-file label="Upload" @input="uploadFile">
                        <template v-slot:prepend>
                        <q-icon name="cloud_upload" />
                        </template>
                    </q-file>

                    <q-btn label="Download" @click="download()" no-caps />
                    
        
                </q-toolbar>
            </q-header>
  
            <q-page-container>
                <q-page>
                    <div v-if="isLoaded">
                        <div v-for="bank in banks" :key="bank.index">
                            <b>Bank {{bank.index}} : {{ bank.name }}</b>
                            <div v-for="page in bank.pages" :key="page.index">
                                Page {{page.index}} : {{ page.name }}
                                <div v-for="slot in page.slots" :key="slot.index">
                                    {{ slot.comment }}
                                </div>
                            </div>
                            <hr>
                        </div>
                    </div>
                    <div v-else>
                        Please load file using a button on header
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>      
    </div>  
</template>

<script>
import Utility from "../modx_liveset_utility"
import { Buffer } from 'buffer';
import { exportFile } from 'quasar'

export default {
    data() {
        return {
            isLoaded: false,
            banks : [],
        };
    },
    created() {
        this.utility = new Utility.ModxLivesetUtility();
        this.banks = new Array(8);
        for (let bankIndex = 0; bankIndex < 8; ++bankIndex) {
            this.banks[bankIndex] = { name: "", index:bankIndex + 1, pages:new Array(16) };
            for (let pageIndex = 0; pageIndex < 16; ++pageIndex) {
                this.banks[bankIndex].pages[pageIndex] = { name:"", index: pageIndex + 1, slots:new Array(16) };
                for (let slotIndex = 0; slotIndex < 16; ++slotIndex) {
                    this.banks[bankIndex].pages[pageIndex].slots[slotIndex] = { index: slotIndex + 1, comment: "" };
                }
            }
        }
    },
    methods: {
        uploadFile(file) {
            const fileObject = file.target.files[0];

            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(fileObject);

            fileReader.onload = () => {
                try {
                    this.utility.setX8ADataBuffer(Buffer.from(fileReader.result));

                    const numOfBanks = this.utility.getNumOfBanks();
                    const numOfPages = 16;
                    this.message = "";
                    for (let bankIndex = 0; bankIndex < numOfBanks; ++bankIndex) {
                        const bankName = this.utility.getBankName(bankIndex);
                        this.banks[bankIndex].name = bankName;
                        for (let pageIndex = 0; pageIndex < numOfPages; ++pageIndex) {
                            const pageName = this.utility.getPageName(bankIndex, pageIndex);
                            this.banks[bankIndex].pages[pageIndex].name = pageName;
                            for (let slotIndex = 0; slotIndex < 16; ++slotIndex) {
                                this.banks[bankIndex].pages[pageIndex].slots[slotIndex].comment = this.utility.getSlotComment(bankIndex, pageIndex, slotIndex);
                            }
                        }
                    }

                    this.isLoaded = true;
                } catch (e) {
                    console.log(e);
                }
            };
        },
        download() {
            const x8aDataBuffer = this.utility.getX8ADataBuffer();
            const status = exportFile('Backup.x8a', x8aDataBuffer);
            if (status) {
                console.log("Succeed");
            } else {
                console.log("Failed " + status);
            }
        }
    }
};
</script>

<style>

</style>