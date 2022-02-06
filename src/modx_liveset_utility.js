// YAMAHA MODX Liveset Utility
// Copyright © 2021 Masaki Ono. All rights reserved.

// these const values are only used in ModxLivesetUtility

import { Buffer } from 'buffer';

const NUM_BANK = 8;
const NUM_PAGE = 16;
const NUM_SLOT = 16;
const SIZE_SLOT = 0x11E;
const SIZE_PAGE = SIZE_SLOT * 16 + 0x15;

class ModxLivesetUtility {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        this.x8aData_ = null;
        this.isDataValid_ = false;

        this.bankAddresses_ = new Array(NUM_BANK);
        this.bankNameAddresses_ = new Array(NUM_BANK);
        
        this.pageAddresses_ = new Array(NUM_BANK);
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) this.pageAddresses_[bankIndex] = new Array(NUM_PAGE);

        this.slotAddresses_ = new Array(NUM_BANK);
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            this.slotAddresses_[bankIndex] = new Array(NUM_PAGE);
            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                this.slotAddresses_[bankIndex][pageIndex] = new Array(NUM_SLOT);
            }
        }

        this.numOfBanks_ = 0;
    }

    setX8ADataBuffer(x8aDataBuffer) {
        this.initialize();

        this.x8aDataBuffer_ = Buffer.from(x8aDataBuffer);

        // Search DLST from header
        const header_buffer = x8aDataBuffer.slice(0, 0x110);
        let dlst_addr_index = header_buffer.indexOf(Buffer.from('DLST'));
        if (dlst_addr_index < 0) throw('DLST not found in the header');
        dlst_addr_index += 0x04;
        const dlst_addr = x8aDataBuffer.readInt32BE(dlst_addr_index);

        // Mark addresses
        this.numOfBanks_ = x8aDataBuffer.readInt16BE(dlst_addr + 4);
        if (NUM_BANK < this.numOfBanks_) throw("Invalid number of banks")
        console.log("Num of banks : " + this.numOfBanks_);

        let readIndex = dlst_addr + 4 /* DLST */ + 8 /* ? */;
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            this.bankAddresses_[bankIndex] = readIndex;

            // Skip "Data" + ?
            readIndex += 4 /* Data */ + 8 /* ? */;

            this.bankNameAddresses_[bankIndex] = readIndex;
            readIndex += 0x15;

            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                this.pageAddresses_[bankIndex][pageIndex] = readIndex;
                readIndex += 0x15;
                
                for (let slotIndex = 0; slotIndex < NUM_SLOT; ++slotIndex) {
                    this.slotAddresses_[bankIndex][pageIndex][slotIndex] = readIndex;
                    readIndex += SIZE_SLOT;
                }
            }
        }

        // ELST (Currently not used)
        /*
        let elst_addr_index = header_buffer.indexOf(Buffer.from('ELST'));
        if (elst_addr_index < 0) throw('ELST not found');
        elst_addr_index += 0x04;

        const elst_addr = x8aDataBuffer.readInt32BE(elst_addr_index);

        readIndex = elst_addr + 0x0c;
        for (let bankIndex = 0; bankIndex < this.numOfBanks_; ++bankIndex) {
            readIndex += 0x04; // Skip "Entr"

            const size = x8aDataBuffer.readInt32BE(readIndex);
            readIndex += 0x04;
            const name_length = size - 0x16 - 0x02;

            console.log(x8aDataBuffer.slice(readIndex + 0x14, readIndex + 0x16));
            readIndex += 0x16;

            console.log(this.createValidStringFromNullTerminatedBufferIndex(readIndex, name_length + 0x02));
            readIndex += name_length + 0x02;
        }
        */
        
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

        return this.createValidStringFromNullTerminatedBufferIndex(this.bankNameAddresses_[bankIndex], 0x15);
    }

    getPageName(bankIndex, pageIndex) {
        if (!this.isDataValid_)            throw("Invalid data");
        if (this.numOfBanks_ <= bankIndex) throw("Bank index : out of range");
        if (NUM_PAGE <= pageIndex)         throw("Page index : out of range");

        return this.createValidStringFromNullTerminatedBufferIndex(this.pageAddresses_[bankIndex][pageIndex], 0x15);
    }

    getSlotComment(bankIndex, pageIndex, slotIndex) {
        if (!this.isDataValid_)            throw("Invalid data");
        if (this.numOfBanks_ <= bankIndex) throw("Bank index : out of range");
        if (NUM_PAGE <= pageIndex)         throw("Page index : out of range");
        if (NUM_SLOT <= slotIndex)         throw("Slot index : out of range");

        return this.createValidStringFromNullTerminatedBufferIndex(this.slotAddresses_[bankIndex][pageIndex][slotIndex], 0x15);
    }

    copyAndPastePage(fromBankIndex, fromPageIndex, toBankIndex, toPageIndex) {
        const readIndex  = this.pageAddresses_[fromBankIndex][fromPageIndex];
        const writeIndex = this.pageAddresses_[toBankIndex][toPageIndex];

        for (let index = 0; index < SIZE_PAGE; ++index) {
            this.x8aDataBuffer_[writeIndex + index] = this.x8aDataBuffer_[readIndex + index];
        }
    }

    copyAndPasteAllPages(fromBankIndex, toBankIndex) {
        for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
            this.copyAndPastePage(fromBankIndex, pageIndex, toBankIndex, pageIndex);
        }
    }

    swapPage(bankIndexA, pageIndexA, bankIndexB, pageIndexB) {
        const indexA =  this.pageAddresses_[bankIndexA][pageIndexA];
        const indexB =  this.pageAddresses_[bankIndexB][pageIndexB];

        for (let index = 0; index < SIZE_PAGE; ++index) {
            const aData = this.x8aDataBuffer_[indexA + index];
            this.x8aDataBuffer_[indexA + index] = this.x8aDataBuffer_[indexB + index];
            this.x8aDataBuffer_[indexB + index] = aData;
        }
    }

    swapAllPages(bankIndexA, bankIndexB) {
        for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
            this.swapPage(bankIndexA, pageIndex, bankIndexB, pageIndex);
        }
    }

    print() {
        // for debug
        for (let bankIndex = 0; bankIndex < this.numOfBanks_; ++bankIndex) {
            console.log(`Bank${bankIndex + 1} : ${this.getBankName(bankIndex)}`);

            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                console.log(`  Page${pageIndex + 1} : ${this.getPageName(bankIndex, pageIndex)}`);
                for (let slotIndex = 0; slotIndex < NUM_SLOT; ++slotIndex) {
                    const comment = this.getSlotComment(bankIndex, pageIndex, slotIndex);
                    if (comment != "") console.log(`    Slot${slotIndex + 1} : ${comment}`);
                }
            }
        }
    }

    createValidStringFromNullTerminatedBufferIndex(index, size) {
        const buffer = this.x8aDataBuffer_.slice(index, index + size);
        return buffer.slice(0, buffer.indexOf(0)).toString();
    }
}

export default {
    ModxLivesetUtility
};