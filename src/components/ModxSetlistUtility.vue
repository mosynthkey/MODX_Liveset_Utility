<template>
    <div id="q-app">
        <q-layout class="shadow-2 rounded-borders">
            <q-header>
                <q-toolbar class="bg-header">
                    <q-toolbar-title>MODX LiveSet Utility</q-toolbar-title>

                    <q-file ref="fileOpenRef" class="hidden" @input="uploadFile" accept=".X8A"></q-file>

                    <q-btn v-if="clipBoard.bankIndex != -1" :label="copiedPageName" @click="clipBoard.bankIndex = -1" icon="content_paste_off" color="card-background" no-caps
                    :class="isLoaded ? 'q-mr-md' : ''"  />

                    <q-btn label="Open" @click="openFile()" icon="file_open" color="open"
                        :class="isLoaded ? 'q-mr-md' : ''" no-caps />
                    <q-btn v-if="isLoaded" label="Download" @click="download()" icon="file_download" color="download"
                        no-caps />

                </q-toolbar>
            </q-header>

            <q-page-container>
                <q-dialog v-model="loadedButNoBank">
                    <q-card>
                        <q-card-section>
                            <div class="text-h6">Error</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                            No liveset data is found in this file. <br>
                            Please create liveset with MODX and use this app.<br>
                            <br>
                            このデータにlivesetの情報が含まれていませんでした。<br>
                            MODXでLivesetの編集をした後にこのツールをご使用ください。<br>
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn flat label="OK" color="primary" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <q-dialog v-model="loadedButInvalid">
                    <q-card>
                        <q-card-section>
                            <div class="text-h6">Error</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                            Unknown data format.<br>
                            <br>
                            このアプリでは読み込めないファイルです。<br>
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn flat label="OK" color="primary" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <q-dialog v-model="editButOpen">
                    <q-card>
                        <q-card-section>
                            <div class="text-h6">Alert</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                            Do you want to discard the change and open another file?<br>
                            変更内容を破棄して別のBackup fileを開きますか?
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn flat label="OK" @click="fileOpenRef.pickFiles()" v-close-popup/>
                            <q-btn flat label="Cancel" color="primary" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>


                <q-dialog v-model="couldntDownload">
                    <q-card>
                        <q-card-section>
                            <div class="text-h6">Error</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                            Couldn't download in some reason.<br>
                            ダウンロードできませんでした。<br>
                            <br>
                            {{reasonWhyCouldntDownload}}
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn flat label="OK" color="primary" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <q-page class="bg-main fit row justify-center">
                    <div v-if="isLoaded" class="q-pa-md row items-center q-gutter-md">
                        <q-card flat v-for="bank in banks" :key="bank.index"
                            style="width: 300px">
                            <q-list dense class="bg-card-header text-white" style="max-width: 600px">
                                <q-item>
                                    <q-item-section>
                                        <b>{{ bank.name }}</b>
                                    </q-item-section>
                                    
                                    <q-item-section side>
                                        <div class="text-grey-8 q-gutter-xs">
                                            <q-btn :disable="bank.index==0" @click="swapBank(bank.index, bank.index - 1)"
                                                :class="bank.index==0 ? 'text-grey-8' : 'text-white'" size="10px" flat dense round icon="west" no-caps />
                                            <q-btn :disable="bank.index==7" @click="swapBank(bank.index, bank.index + 1)"
                                                :class="bank.index==7 ? 'text-grey-8' : 'text-white'" size="10px" flat dense round icon="east" no-caps />
                                        </div>
                                    </q-item-section>
                                </q-item>
                            </q-list>

                            <q-separator />

                            <q-list dense class="bg-card-background text-white" style="max-width: 600px" v-for="page in bank.pages"
                                :key="page.index">
                                <q-item>
                                    <q-item-section>
                                        <b>{{ page.name }}</b>
                                    </q-item-section>

                                    <q-item-section side>
                                        <div class="text-grey-8 q-gutter-xs">
                                            <q-btn :disabled="page.index==0"
                                                @click="swapPage(bank.index, page.index, page.index - 1)" :class="page.index==0 ? 'text-grey-8' : 'text-white'"
                                                size="10px" flat dense round icon="arrow_upward"/>
                                            <q-btn :disabled="page.index==15"
                                                @click="swapPage(bank.index, page.index, page.index + 1)" :class="page.index==15 ? 'text-grey-8' : 'text-white'"
                                                size="10px" flat dense round icon="arrow_downward" />
                                            <q-btn v-if="clipBoard.bankIndex==-1" @click="copyPage(bank.index, page.index)" class="text-white" size="10px"
                                                flat dense round icon="content_copy" />
                                            <q-btn v-if="clipBoard.bankIndex!=-1"
                                                @click="pastePage(bank.index, page.index)" class="text-white" size="10px"
                                                flat dense round icon="content_paste" />
                                        </div>
                                    </q-item-section>

                                </q-item>
                            </q-list>

                        </q-card>
                    </div>

                    <div v-else>
                        <div class="q-pa-md row items-start q-gutter-md">

                            <q-card class="my-card" flat bordered>
                                <q-card-section>
                                    <q-card-section>
                                        <div class="text-h4">
                                            <b>Welcome to MODX LiveSet Utility</b>
                                        </div>
                                        <q-separator horizontal />
                                        <br>
                                        <div class="text-h6">
                                            By using this app, you can swap, copy & paste the banks and pages of
                                            LiveSet.<br>
                                            このアプリを使うことで、LiveSetのBankやPageの入れ替えやコピー&ペーストが可能です。<br>
                                        </div>
                                        <br>
                                        <div class="text-red-14 text-h6">
                                            Please use this app at your own risk.<br>
                                            The author is not responsible for any damage caused by the use of this
                                            app.<br>
                                            このソフトの使用は自己責任でお願いします。<br>
                                            ソフトの使用によるいかなる損害等については責任をおいかねます。<br>
                                        </div>

                                        <br><br>

                                        <div class="text-h6">Step 1</div>
                                        <q-separator horizontal />
                                        <div class="q-pa-md row">
                                            Create a backup file with MODX.<br>
                                            MODXでBackup fileを作成してください。
                                        </div>

                                        <div class="text-h6">Step 2</div>
                                        <q-separator horizontal />
                                        <div class="q-pa-md row">
                                            Press open button to load the backup file.<br>
                                            Step 1で作成したBackup fileを"Open"ボタンを押して開いてください。
                                        </div>

                                        <div class="text-h6">Step 3</div>
                                        <q-separator horizontal />
                                        <div class="q-pa-md row">
                                            After editing, press download button to download a modified backup file.<br>
                                            編集をしたあとに"Download"ボタンをおして、変更されたバックアップデータをダウンロードしてください。
                                        </div>

                                        <div class="text-h6">Step 4</div>
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
    let isValid = ref(false);
    let utility = ref(new Utility.ModxLivesetUtility());
    let banks = ref([]);
    let fileOpenRef = ref(null);
    let clipBoard = ref({
        bankIndex: -1,
        pageIndex: -1
    });
    let numOfBanks = ref(0);
    let loadedButNoBank = ref(false);
    let loadedButInvalid = ref(false);
    let isEdit = ref(false);
    let editButOpen = ref(false);
    let fileName = ref("");
    let couldntDownload = ref(false);
    let reasonWhyCouldntDownload = ref("");
    let copiedPageName = ref("");

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
                fileName.value = fileObject.name;
            } catch (e) {
                if (e == "DLST not found in the header") {
                    loadedButNoBank.value = true;
                } else {
                    loadedButInvalid.value = true;
                }
                console.log(e);
                isValid.value = false;
                isLoaded.value = false;
            }
        };
    }

    function init() {
        loadedButNoBank.value = false;
        loadedButInvalid.value = false;
        isEdit.value = false;
        editButOpen.value = false;
        couldntDownload.value = false;
        reasonWhyCouldntDownload.value = "";
        copiedPageName.value = "";
        clipBoard.value.bankIndex = -1;

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
        loadedButNoBank.value = (numOfBanks.value == 0);
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

        let fileName_ = fileName.value.substring(fileName.value.lastIndexOf('/') + 1); 
        if (fileName_.lastIndexOf(".") != -1) fileName_ = fileName_.substring(0, fileName_.lastIndexOf("."));

        const status = exportFile(fileName_ + "_Mod.X8A", x8aDataBuffer);
        if (status) {
            console.log("Succeed");
        } else {
            couldntDownload.value = true;
            reasonWhyCouldntDownload.value = status;
        }
    }

    function openFile() {
        if (isEdit.value == true) {
            editButOpen.value = true;
        } else {
            fileOpenRef.value.pickFiles();
        }
    }

    function swapPage(bankIndex, pageIndexA, pageIndexB) {
        if (isValidBankIndex(bankIndex) && isValidPageIndex(pageIndexA) && isValidPageIndex(pageIndexB)) {
            utility.value.swapPage(bankIndex, pageIndexA, bankIndex, pageIndexB);
            update();
            isEdit.value = true;
        }
    }

    function copyPage(bankIndex, pageIndex) {
        if (isValidBankIndex(bankIndex) && isValidPageIndex(pageIndex)) {
            clipBoard.value.bankIndex = bankIndex;
            clipBoard.value.pageIndex = pageIndex;
            copiedPageName.value = "Clear Clipboard (" + utility.value.getBankName(bankIndex) + " / " + utility.value.getPageName(bankIndex, pageIndex) + ")";
        }
    }

    function pastePage(bankIndex, pageIndex) {
        if (isValidBankIndex(bankIndex) && isValidPageIndex(pageIndex) && clipBoard.value.bankIndex != -1) {
            utility.value.copyAndPastePage(clipBoard.value.bankIndex, clipBoard.value.pageIndex, bankIndex, pageIndex);
            clipBoard.value.bankIndex = -1;
            clipBoard.value.pageIndex = -1;
            update();
            isEdit.value = true;
        }
    }

    function swapBank(bankIndexA, bankIndexB) {
        if (isValidBankIndex(bankIndexA) && isValidBankIndex(bankIndexB)) {
            utility.value.swapBank(bankIndexA, bankIndexB);
            update();
            isEdit.value = true;
        }
    }

    function isValidBankIndex(index) {
        return (0 <= index && index <= 15);
    }

    function isValidPageIndex(index) {
        return (0 <= index && index <= 15);
    }
</script>

<style>
    .bg-header {
        background: #212421 !important;
    }

    .bg-main {
        background: #6B8283 !important;
    }

    .bg-open {
        background: #75A5FF !important;
    }

    .bg-download {
        background: #FF6100 !important;
    }

    .bg-card-background {
        background: #42494A !important;
    }

    .bg-card-header {
        background: #212421 !important;
    }
</style>