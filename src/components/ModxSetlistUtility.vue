<template>
    <div id="q-app">
        <q-layout class="shadow-2 rounded-borders">
            <q-header>
                <q-toolbar>
                    <q-toolbar-title>MODX LiveSet Utility</q-toolbar-title>

                    <q-file ref="fileOpenRef" class="hidden" @input="uploadFile"></q-file>

                    <q-btn label="Open" @click="openFile()" icon="file_open" no-caps />
                    <q-btn v-if="isLoaded" label="Download" @click="download()" icon="file_download" no-caps />

                </q-toolbar>
            </q-header>

            <q-page-container>
                <q-page>
                    <div v-if="isLoaded">
                        <div v-if="numOfBanks==0">
                            Error:<br>
                            No liveset data is found in this file. Please create liveset with MODX and use this app.<br>
                            このデータにlivesetの情報が含まれていませんでした。MODXでLivesetの編集をした後にこのツールをご使用ください。<br>
                        </div>

                        <div v-else-if="!isValid">
                            Error:<br>
                            Unknown data format.<br>
                            このアプリでは読み込めないファイルです。<br>
                        </div>

                        <div v-else class="q-pa-md row items-center q-gutter-md">
                            <q-card class="my-card" flat bordered v-for="bank in banks" :key="bank.index"
                                style="width: 300px">
                                <q-card-section horizontal>
                                    <q-card-section class="q-pa-xs">
                                        <b>{{ bank.name }}</b>
                                    </q-card-section>
                                </q-card-section>


                                <q-separator />

                                <q-card-actions>
                                    <q-btn :disable="bank.index==0" @click="swapBank(bank.index, bank.index - 1)"
                                        class="gt-xs" size="10px" flat dense round icon="west" />
                                    <q-btn :disable="bank.index==7" @click="swapBank(bank.index, bank.index + 1)"
                                        class="gt-xs" size="10px" flat dense round icon="east" />
                                </q-card-actions>

                                <q-list dense class="rounded-borders" style="max-width: 600px"
                                    v-for="page in bank.pages" :key="page.index">
                                    <q-item>
                                        <q-item-section top>
                                            {{ page.name }}
                                        </q-item-section>

                                        <q-item-section top side>
                                            <div class="text-grey-8 q-gutter-xs">
                                                <q-btn :disabled="page.index==0"
                                                    @click="swapPage(bank.index, page.index, page.index - 1)"
                                                    class="gt-xs" size="10px" flat dense round icon="arrow_upward" />
                                                <q-btn :disabled="page.index==15"
                                                    @click="swapPage(bank.index, page.index, page.index + 1)"
                                                    class="gt-xs" size="10px" flat dense round icon="arrow_downward" />
                                                <q-btn @click="copyPage(bank.index, page.index)" class="gt-xs"
                                                    size="10px" flat dense round icon="content_copy" />
                                                <q-btn :disable="clipBoard.bankIndex==-1"
                                                    @click="pastePage(bank.index, page.index)" class="gt-xs" size="10px"
                                                    flat dense round icon="content_paste" />
                                            </div>
                                        </q-item-section>

                                    </q-item>
                                </q-list>

                            </q-card>
                        </div>

                    </div>
                    <div v-else>
                        <div class="q-pa-md row items-start q-gutter-md">
                            
                        <q-card class="my-card" flat bordered>
                            <q-card-section horizontal>
                                <q-card-section>
                                    <b>Step 1</b><br>
                                    <q-separator horizontal />
                                                                        <div class="q-pa-md row">
                                    Create a backup file with MODX.<br>
                                    MODXでBackup fileを作成してください。
                                    </div>
                                </q-card-section>

                                <q-separator vertical />

                                <q-card-section>
                                    <b>Step 2</b><br>
                                    <q-separator horizontal />
                                    <div class="q-pa-md row">
                                    Press open button to load the backup file.<br>
                                    1で作成したBackup fileを"Open"ボタンを押して開いてください。
                                    </div>
                                </q-card-section>

                                <q-separator vertical />

                                <q-card-section>
                                    <b>Step 3</b><br>
                                    <q-separator horizontal />
                                                                        <div class="q-pa-md row">
                                    After editing, press download button to download a modified backup file.<br>
                                    編集をしたあとに"Download"ボタンをおして、変更されたバックアップデータをダウンロードしてください。
                                    </div>
                                </q-card-section>


                                <q-separator vertical />

                                <q-card-section>
                                    <b>Step 4</b><br>
                                    <q-separator horizontal />
                                                                        <div class="q-pa-md row">
                                    Load the downloaded backup file with MODX.<br>
                                    MODXでバックアップファイルを読み込んでください。<br>
                                    </div>
                                </q-card-section>

                            </q-card-section>
                        </q-card>
                        </div>
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script setup>
    import Utility from "../modx_liveset_utility"
    import { Buffer } from 'buffer';
    import { exportFile } from 'quasar'
    import { ref } from 'vue'

    let isLoaded = ref(false);
    let isValid = ref(false);
    let utility = ref(new Utility.ModxLivesetUtility());
    let banks = ref([]);
    let fileOpenRef = ref(null);
    let clipBoard = ref({bankIndex:-1, pageIndex:-1});
    let numOfBanks = ref(0);

    init();

    function uploadFile(file) {
        const fileObject = file.target.files[0];

        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(fileObject);

        fileReader.onload = () => {
            try {
                utility.value.setX8ADataBuffer(Buffer.from(fileReader.result));
                update();
                isValid.value = true;
                isLoaded.value = utility.value.isValidData();
            } catch (e) {
                console.log(e);
                isValid.value = false;
            }
        };
    }

    function init() {
        banks.value = [];
        for (let bankIndex = 0; bankIndex < numOfBanks.value; ++bankIndex) {
            banks.value[bankIndex] = {
                name: "",
                index: bankIndex,
                pages: new Array(16)
            };
            for (let pageIndex = 0; pageIndex < 16; ++pageIndex) {
                banks.value[bankIndex].pages[pageIndex] = {
                    name: "",
                    index: pageIndex,
                    slots: new Array(16)
                };
                for (let slotIndex = 0; slotIndex < 16; ++slotIndex) {
                    banks.value[bankIndex].pages[pageIndex].slots[slotIndex] = {
                        index: slotIndex,
                        comment: ""
                    };
                }
            }
        }
    }

    function update() {
        numOfBanks.value = utility.value.getNumOfBanks();
        init();

        const numOfPages = 16;

        for (let bankIndex = 0; bankIndex < numOfBanks.value; ++bankIndex) {
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

    function openFile() {
        fileOpenRef.value.pickFiles();
    }

    function swapPage(bankIndex, pageIndexA, pageIndexB) {
        if (isValidBankIndex(bankIndex) && isValidPageIndex(pageIndexA) && isValidPageIndex(pageIndexB)) {
            utility.value.swapPage(bankIndex, pageIndexA, bankIndex, pageIndexB);
            update();
        }
        console.log(`${bankIndex} - ${pageIndexA} - ${pageIndexB}`);
    }

    function copyPage(bankIndex, pageIndex) {
        if (isValidBankIndex(bankIndex) && isValidPageIndex(pageIndex)) {
            console.log(`copy ${bankIndex} - ${pageIndex}`);
            clipBoard.value.bankIndex = bankIndex;
            clipBoard.value.pageIndex = pageIndex;
        }
    }

    function pastePage(bankIndex, pageIndex) {
        if (isValidBankIndex(bankIndex) && isValidPageIndex(pageIndex) && clipBoard.value.bankIndex != -1) {
            utility.value.copyAndPastePage(clipBoard.value.bankIndex, clipBoard.value.pageIndex, bankIndex, pageIndex);
            clipBoard.value.bankIndex = -1;
            clipBoard.value.pageIndex = -1;
            update();
        }
        console.log(`${bankIndex} - ${pageIndex}`);
    }

    function swapBank(bankIndexA, bankIndexB) {
        if (isValidBankIndex(bankIndexA) && isValidBankIndex(bankIndexB)) {
            utility.value.swapBank(bankIndexA, bankIndexB);
            update();  
        }
    }

    function isValidBankIndex(index) { return (0 <= index && index <= 15); }

    function isValidPageIndex(index) { return (0 <= index && index <= 15); }
</script>

<style>

</style>