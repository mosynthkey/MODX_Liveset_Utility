// YAMAHA MODX Liveset Utility
// Copyright © 2021 Masaki Ono. All rights reserved.

'use strict';

const fs = require("fs");

// see doc/x8a_structure.md for detail

class ModxLivesetUtility {
    constructor() {
        this.x8aData_ = null;
        this.isDataValid_ = false;
    }

    setX8ADataBuffer(x8aDataBuffer) {
        this.x8aDataBuffer_ = x8aDataBuffer;

        // validate

        // Search DLST from header
        const header_buffer = x8aDataBuffer.subarray(0, 0x110);
        let dlst_addr_index = header_buffer.indexOf(Buffer.from('DLST'));
        if (dlst_addr_index < 0) throw('DLST not found');
        dlst_addr_index += 0x04;

        const dlst_addr = x8aDataBuffer.subarray(dlst_addr_index, dlst_addr_index + 4).readInt32BE();

        const NUM_BANK = 8;
        const NUM_PAGE = 16;
        const NUM_SLOT = 16;
        const SIZE_SLOT = 0x11E;

        {
            // debug
            console.log(x8aDataBuffer.subarray(dlst_addr + 4, dlst_addr + 4 + 8));
        }

        let readIndex = dlst_addr + 4 /* DLST */ + 8 /* ? */;
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            
            {
                // debug
                const bankHeaderBuffer = x8aDataBuffer.subarray(readIndex, readIndex + 0x0c);
                console.log(bankHeaderBuffer.subarray(4, 4 + 8));
            }
            
            // Skip "Data" + ?
            readIndex += 4 /* Data */ + 8 /* ? */;
            //console.log("Addr = 0x" + readIndex.toString(16));
            const bankNameBuffer = x8aDataBuffer.subarray(readIndex, readIndex + 0x15);
            console.log("Bank " + bankIndex + ": " + createValidStringFromNullTerminatedBuffer(bankNameBuffer));
            readIndex += 0x15;

            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                // Get page name
                const pageNameBuffer = x8aDataBuffer.subarray(readIndex, readIndex + 0x15);
                console.log("  Page " + pageIndex + ": " + createValidStringFromNullTerminatedBuffer(pageNameBuffer));
                readIndex += 0x15;
                
                for (let slotIndex = 0; slotIndex < NUM_SLOT; ++slotIndex) {
                    const slotBuffer = x8aDataBuffer.subarray(readIndex, readIndex + SIZE_SLOT);
                    readIndex += SIZE_SLOT;

                    const slotCommentBuffer = slotBuffer.subarray(0, 0x15);
                    //console.log("    Slot " + slotIndex + ": " + createValidStringFromNullTerminatedBuffer(slotCommentBuffer));
                }
            }
        }

        let elst_addr_index = header_buffer.indexOf(Buffer.from('ELST'));
        if (elst_addr_index < 0) throw('ELST not found');
        elst_addr_index += 0x04;

        const elst_addr_buffer = x8aDataBuffer.subarray(elst_addr_index, elst_addr_index + 4);
        const elst_addr = elst_addr_buffer.readInt32BE();

        console.log("---");
        const hoge_buffer = x8aDataBuffer.subarray(elst_addr + 0x04, elst_addr + 0x04 + 8);
        console.log(hoge_buffer);
        console.log(hoge_buffer.subarray(0,4).readInt32BE());
        console.log(hoge_buffer.subarray(4,8).readInt32BE());

        readIndex = elst_addr + 0x0c;
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            console.log("0x" + readIndex.toString(16));
            readIndex += 0x04; // Skip "ELST"

            const fuga_buffer = x8aDataBuffer.subarray(readIndex, readIndex + 0x1a);
            readIndex += 0x1a;
            console.log(fuga_buffer);
            {
                for (let i = 0; i < 6; ++i) {
                    let buffer = fuga_buffer.subarray(i * 4, (i + 1) * 4);
                    console.log(buffer);
                    console.log(buffer.readInt32BE());
                }
            }
            console.log("-");

            const bank_name_buffer = Buffer.alloc(0x15);
            for (let nameIndex = 0; ; ++nameIndex) {
                bank_name_buffer[nameIndex] = x8aDataBuffer[readIndex + nameIndex];
                if (bank_name_buffer[nameIndex] == 0) {
                    readIndex += (nameIndex + 2);
                    break;
                }
            }
            console.log("    Bank " + bankIndex + ": " + createValidStringFromNullTerminatedBuffer(bank_name_buffer));
        }  
        
        this.isDataValid_ = true;
    }

    getNumOfBanks() {

    }

    getNameOfBank(bankIndex) {

    }

    getNameOfPage(bankIndex, pageIndex) {

    }    
}

function createValidStringFromNullTerminatedBuffer(buffer) {
    return buffer.subarray(0, buffer.indexOf(0)).toString();
}

function printLivesetContents(fileName) {
    try {
        let utility = new ModxLivesetUtility();
        utility.setX8ADataBuffer(fs.readFileSync(fileName));        
    } catch (e) {
        console.log(e);
    }
};

printLivesetContents("data/MODX_2021_02_02.X8A");