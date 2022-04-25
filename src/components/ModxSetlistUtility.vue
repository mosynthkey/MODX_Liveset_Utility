<template>
    <div id="q-app">
        <q-layout class="shadow-2 rounded-borders">
            <q-header>
                <q-toolbar>
                    <q-btn flat round dense icon="menu" class="q-mr-sm"></q-btn>

                    <q-toolbar-title>MODX LIVESET Utility</q-toolbar-title>

                    <q-file label="Upload" @input="uploadFile">
                        <template v-slot:prepend>
                            <q-icon name="cloud_upload" />
                        </template>
                    </q-file>

                    <q-btn label="Download" @click="download()" no-caps />
                    <q-btn label="Debug" @click="debug()" no-caps />

                </q-toolbar>
            </q-header>



            <q-page-container>
                <q-page>
                    <div v-if="isLoaded">
                        <div v-for="bank in banks" :key="bank.index">
                            <div class="q-pa-md row items-start q-gutter-md">
                                <q-card class="my-card" flat bordered>
                                    <q-card-section horizontal>
                                        <q-card-section class="q-pt-xs">
                                            <div class="text-h5 q-mt-sm q-mb-xs">{{ bank.name }}</div>
                                        </q-card-section>
                                    </q-card-section>

                                    <q-separator />

                                    <q-list bordered class="rounded-borders" style="max-width: 600px" v-for="page in bank.pages" :key="page.index">
                                        <q-item>
                                            <q-item-section top>
                                                {{ page.name }}
                                            </q-item-section>

                                            <q-item-section top side>
                                                <div class="text-grey-8 q-gutter-xs">
                                                    <q-btn class="gt-xs" size="12px" flat dense round icon="delete" />
                                                    <q-btn class="gt-xs" size="12px" flat dense round icon="done" />
                                                    <q-btn size="12px" flat dense round icon="more_vert" />
                                                </div>
                                            </q-item-section>

                                        </q-item>
                                    </q-list>
                                    <q-separator />
                                    <q-card-actions>


                                    <q-btn flat round icon="event" />
                                        <q-btn flat>
                                            7:30PM
                                        </q-btn>
                                        <q-btn flat color="primary">
                                            Reserve
                                        </q-btn>
                                    </q-card-actions>
                                </q-card>
                            </div>
                            <!--
                            <b>Bank {{bank.index}} : {{ bank.name }}</b>
                            <div v-for="page in bank.pages" :key="page.index">
                                Page {{page.index}} : {{ page.name }}
                                <div v-for="slot in page.slots" :key="slot.index">
                                    {{ slot.comment }}
                                </div>
                            </div>
                            -->
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

<script setup>
    import Utility from "../modx_liveset_utility"
    import {
        Buffer
    } from 'buffer';
    import {
        exportFile
    } from 'quasar'
    import {
        ref
    } from 'vue'

    let isLoaded = ref(false);
    let utility = ref(new Utility.ModxLivesetUtility());
    let banks = ref(new Array(8));

    for (let bankIndex = 0; bankIndex < 8; ++bankIndex) {
        banks.value[bankIndex] = {
            name: "",
            index: bankIndex + 1,
            pages: new Array(16)
        };
        for (let pageIndex = 0; pageIndex < 16; ++pageIndex) {
            banks.value[bankIndex].pages[pageIndex] = {
                name: "",
                index: pageIndex + 1,
                slots: new Array(16)
            };
            for (let slotIndex = 0; slotIndex < 16; ++slotIndex) {
                banks.value[bankIndex].pages[pageIndex].slots[slotIndex] = {
                    index: slotIndex + 1,
                    comment: ""
                };
            }
        }
    }
    console.log(banks.value);

    function uploadFile(file) {
        const fileObject = file.target.files[0];

        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(fileObject);

        fileReader.onload = () => {
            try {
                utility.value.setX8ADataBuffer(Buffer.from(fileReader.result));
                update();
                isLoaded.value = true;
            } catch (e) {
                console.log(e);
            }
        };
    }

    function update() {
        const numOfBanks = utility.value.getNumOfBanks();
        const numOfPages = 16;

        for (let bankIndex = 0; bankIndex < numOfBanks; ++bankIndex) {
            const bankName = utility.value.getBankName(bankIndex);
            banks.value[bankIndex].name = bankName;
            for (let pageIndex = 0; pageIndex < numOfPages; ++pageIndex) {
                const pageName = utility.value.getPageName(bankIndex, pageIndex);
                banks.value[bankIndex].pages[pageIndex].name = pageName;
                for (let slotIndex = 0; slotIndex < 16; ++slotIndex) {
                    banks.value[bankIndex].pages[pageIndex].slots[slotIndex].comment = utility.value.getSlotComment(
                        bankIndex, pageIndex, slotIndex);
                }
            }
        }
    }

    function download() {
        const x8aDataBuffer = utility.value.getX8ADataBuffer();
        const status = exportFile('Backup.x8a', x8aDataBuffer);
        if (status) {
            console.log("Succeed");
        } else {
            console.log("Failed " + status);
        }
    }

    function debug() {
        utility.value.swapBank(1, 2);
        update();
        //this.download();
    }
</script>

<style>

</style>