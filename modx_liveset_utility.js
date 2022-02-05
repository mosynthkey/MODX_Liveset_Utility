// YAMAHA MODX Liveset Utility
// Copyright © 2021 Masaki Ono. All rights reserved.

'use strict';

const fs = require("fs");

// see doc/x8a_structure.md for detail

// these const values are only used in ModxLivesetUtility
const NUM_BANK = 8;
const NUM_PAGE = 16;
const NUM_SLOT = 16;
const SIZE_SLOT = 0x11E;

class ModxLivesetUtility {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        this.x8aData_ = null;
        this.isDataValid_ = false;
        this.bankName_ = new Array(NUM_BANK);

        this.pageName_ = new Array(NUM_BANK);
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) this.pageName_[bankIndex] = new Array(NUM_PAGE);

        this.slotComment_ = new Array(NUM_BANK);
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            this.slotComment_[bankIndex] = new Array(NUM_PAGE);
            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                this.slotComment_[bankIndex][pageIndex] = new Array(NUM_SLOT);
            }
        }

        this.numOfBanks_ = 0;
    }

    setX8ADataBuffer(x8aDataBuffer) {
        this.initialize();

        this.x8aDataBuffer_ = x8aDataBuffer;

        // Validate

        // Search DLST from header
        const header_buffer = x8aDataBuffer.subarray(0, 0x110);
        let dlst_addr_index = header_buffer.indexOf(Buffer.from('DLST'));
        if (dlst_addr_index < 0) throw('DLST not found in the header');
        dlst_addr_index += 0x04;
        const dlst_addr = x8aDataBuffer.subarray(dlst_addr_index, dlst_addr_index + 4).readInt32BE();

        // Get the number of banks
        this.numOfBanks_ = x8aDataBuffer.subarray(dlst_addr + 4, dlst_addr + 4 + 2).readInt16BE();
        if (NUM_BANK < this.numOfBanks_) throw("Invalid number of banks")
        console.log("Num of banks : " + this.numOfBanks_);


        let readIndex = dlst_addr + 4 /* DLST */ + 8 /* ? */;
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            
            // Skip "Data" + ?
            readIndex += 4 /* Data */ + 8 /* ? */;
            const bankNameBuffer = x8aDataBuffer.subarray(readIndex, readIndex + 0x15);
            this.bankName_[bankIndex] = this.createValidStringFromNullTerminatedBuffer(bankNameBuffer);
            readIndex += 0x15;

            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                // Get page name
                const pageNameBuffer = x8aDataBuffer.subarray(readIndex, readIndex + 0x15);
                this.pageName_[bankIndex][pageIndex] = this.createValidStringFromNullTerminatedBuffer(pageNameBuffer);
                readIndex += 0x15;
                
                for (let slotIndex = 0; slotIndex < NUM_SLOT; ++slotIndex) {
                    const slotBuffer = x8aDataBuffer.subarray(readIndex, readIndex + SIZE_SLOT);
                    readIndex += SIZE_SLOT;
                    this.slotComment_[bankIndex][pageIndex][slotIndex] = this.createValidStringFromNullTerminatedBuffer(slotBuffer.subarray(0, 0x15));
                }
            }
        }

        // ELST (Currently not used)
        let elst_addr_index = header_buffer.indexOf(Buffer.from('ELST'));
        if (elst_addr_index < 0) throw('ELST not found');
        elst_addr_index += 0x04;

        const elst_addr_buffer = x8aDataBuffer.subarray(elst_addr_index, elst_addr_index + 4);
        const elst_addr = elst_addr_buffer.readInt32BE();

        const hoge_buffer = x8aDataBuffer.subarray(elst_addr + 0x04, elst_addr + 0x04 + 8);

        readIndex = elst_addr + 0x0c;
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            // console.log("0x" + readIndex.toString(16));
            readIndex += 0x04; // Skip "ELST"

            const fuga_buffer = x8aDataBuffer.subarray(readIndex, readIndex + 0x1a);
            readIndex += 0x1a;
            // console.log(fuga_buffer);
            {
                for (let i = 0; i < 6; ++i) {
                    let buffer = fuga_buffer.subarray(i * 4, (i + 1) * 4);
                    // console.log(buffer);
                    // console.log(buffer.readInt32BE());
                }
            }
            // console.log("-");

            const bank_name_buffer = Buffer.alloc(0x15);
            for (let nameIndex = 0; ; ++nameIndex) {
                bank_name_buffer[nameIndex] = x8aDataBuffer[readIndex + nameIndex];
                if (bank_name_buffer[nameIndex] == 0) {
                    readIndex += (nameIndex + 2);
                    break;
                }
            }
        }  
        
        this.isDataValid_ = true;
    }

    getX8ADataBuffer() {
        return this.x8aDataBuffer_;
    }

    getNumOfBanks() {
        if (!this.isDataValid_) throw("Invalid data");
        return this.numOfBanks_;
    }

    getBankName(bankIndex) {
        if (!this.isDataValid_)            throw("Invalid data");
        if (this.numOfBanks_ <= bankIndex) throw("Bank index : out of range");

        return this.bankName_[bankIndex];
    }

    getPageName(bankIndex, pageIndex) {
        if (!this.isDataValid_)            throw("Invalid data");
        if (this.numOfBanks_ <= bankIndex) throw("Bank index : out of range");
        if (NUM_PAGE <= pageIndex)         throw("Page index : out of range");

        return this.pageName_[bankIndex][pageIndex];
    }

    getSlotComment(bankIndex, pageIndex, slotIndex) {
        if (!this.isDataValid_)            throw("Invalid data");
        if (this.numOfBanks_ <= bankIndex) throw("Bank index : out of range");
        if (NUM_PAGE <= pageIndex)         throw("Page index : out of range");
        if (NUM_SLOT <= slotIndex)         throw("Slot index : out of range");

        return this.slotComment_[bankIndex][pageIndex][slotIndex];
    }

    createValidStringFromNullTerminatedBuffer(buffer) {
        return buffer.subarray(0, buffer.indexOf(0)).toString();
    }
}

function printLivesetContents(fileName) {
    try {
        let utility = new ModxLivesetUtility();
        utility.setX8ADataBuffer(fs.readFileSync(fileName));    
        
        const numOfBanks = utility.getNumOfBanks();
        for (let bankIndex = 0; bankIndex < numOfBanks; ++bankIndex) {
            console.log(`Bank${bankIndex + 1} : ${utility.getBankName(bankIndex)}`);

            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                console.log(`  Page${pageIndex + 1} : ${utility.getPageName(bankIndex, pageIndex)}`);
                for (let slotIndex = 0; slotIndex < NUM_SLOT; ++slotIndex) {
                    const comment = utility.getSlotComment(bankIndex, pageIndex, slotIndex);
                    if (comment != "") console.log(`    Slot${slotIndex + 1} : ${comment}`);
                }
            }
        }

    } catch (e) {
        console.log(e);
    }
};

printLivesetContents("data/MODX_2021_02_02.X8A");