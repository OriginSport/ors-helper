<template>
  <el-container>
    <el-header>
    <div class="title">{{title}}</div>
    <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">{{currentNet}}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="a">Mainnet</el-dropdown-item>
        <el-dropdown-item command="b">Testnet</el-dropdown-item>
        <el-dropdown-item command="c">DataCenterTest</el-dropdown-item>
        <el-dropdown-item command="d">AddressResolverTest</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    </el-header>
    <el-main class="main-section">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">批量发送糖果</el-menu-item>
      <el-menu-item index="2">发送 Token</el-menu-item>
      <el-menu-item index="3">查询函数</el-menu-item>
      <el-menu-item index="4">执行函数</el-menu-item>
    </el-menu>
    <transition name="fade">
    <div class="main-card" v-if="activeIndex=='1'">
        <br>
        <batch-transfer :addressDesc="batchDesc" @submitData="submitBatchTransfer"></batch-transfer>
    </div>
    <div class="main-card" v-else-if="activeIndex=='2'">
        <br>
        <batch-transfer :addressDesc="singleDesc" @submitData="submitTransfer"></batch-transfer>
    </div>
    <div class="main-card" v-else-if="activeIndex=='3'">
        <br>
        <call-func @submitData="callFunction"></call-func>
    </div>
    <div class="main-card" v-else v-loading="loading" element-loading-text="交易确认中，请耐心等待...">
        <br>
        <call-func @submitData="submitFunction"></call-func>
    </div>
    </transition>
    </el-main>
    <el-footer>
      <div class="footer">
          Copyright © 2018 {{title}}
      </div>
    </el-footer>
  </el-container>
  
</template>

<script>
import CallFunc from './CallFunc.vue'
import BatchTransfer from './BatchTransfer.vue'
import Web3Service from '../services/Web3Service'
import OriginSportToken from '../contracts/OriginSportToken.json'
import DataCenterJson from '../contracts/DataCenter.json'
import AddressResolverJson from '../contracts/AddressResolver.json'
// import { weiToEth, ethToWei, formatEth, formatToken, getStr, getBytes32 } from '../utils/ethUtils'
import { ethToWei, getBytes32 } from '../utils/ethUtils'
 
export default {
  data() {
    return {
      title: 'ORSHelper',
      loading: false,
      listLoading: false,
      activeIndex: '3',
      batchDesc: '目标地址，最多20个，使用逗号隔开',
      singleDesc: '目标地址（只能填写一个）',
      contract: {},
      currentContractName: '',
      currentNet: 'DataCenterTest',
      //currentNet: 'Testnet',
      address: {
        Mainnet: {
          contractAddress: '0xeb9a4b185816c354db92db09cc3b50be60b901b6',
          baseUrl: 'https://mainnet.io'
        },
        Testnet: {
          contractAddress: '0x0a22dccf5bd0faa7e748581693e715afefb2f679',
          baseUrl: 'https://testnet.io'
        },
        DataCenterTest: {
          contractAddress: '0xb07995759885185035a5c41fe202a4fd112d75f2',
          baseUrl: 'https://testnet.io'
        },
        AddressResolverTest: {
          contractAddress: '0x282b192518fc09568de0E66Df8e2533f88C16672',
          baseUrl: 'https://testnet.io'
        }
      }
    };
  },
  computed: {
    
  },
  components: {
    CallFunc,
    BatchTransfer
  },
  created() {
    this.instantiateContract()
  },
  methods: {
    submitBatchTransfer(data) {
      const d = this.formatData(data, 'batchTransfer')
      this.sendFunc(d)
    },
    submitTransfer(data) {
      const d = this.formatData(data, 'transfer')
      this.sendFunc(d)
    },
    submitFunction(data) {
      let d = {}
      let arr = []
      d['func'] = data.func
      if (data.args) {
        data.args.split(',').map(item => {
          arr.push(item)
        })
        d['args'] = JSON.stringify(arr)
      }
      this.sendFunc(d)
    },
    formatData(data, name) {
      let d = {}
      let arr = []
      d['func'] = name
      const recipientsArr = data.recipients.split(',')
      if (recipientsArr.length > 1) {
        arr.push(recipientsArr)
      } else {
        arr.push(recipientsArr[0])
      }
      arr.push(data.value)
      d['args'] = JSON.stringify(arr)
      return d
    },
    handleSelect(key) {
      this.activeIndex = key
    },
    async instantiateContract() {
      // const account = Web3Service.selectedAccount;
      if (this.currentNet == 'DataCenterTest') {
        this.contract = new Web3Service.web3.eth.Contract(DataCenterJson.abi, this.address[this.currentNet].contractAddress);
      } else {
        this.contract = new Web3Service.web3.eth.Contract(OriginSportToken.abi, this.address[this.currentNet].contractAddress);
      }
    },
    handleCommand(command) {
      if (command == 'a') {
        this.currentNet = 'Mainnet'
        this.contract = new Web3Service.web3.eth.Contract(OriginSportToken.abi, this.address[this.currentNet].contractAddress);
      } else if (command == 'b') {
        this.currentNet = 'Testnet'
        this.contract = new Web3Service.web3.eth.Contract(OriginSportToken.abi, this.address[this.currentNet].contractAddress);
      } else if (command == 'c') {
        this.currentNet = 'DataCenterTest'
        this.contract = new Web3Service.web3.eth.Contract(DataCenterJson.abi, this.address[this.currentNet].contractAddress);
      } else {
        this.currentNet = 'AddressResolverTest'
        this.contract = new Web3Service.web3.eth.Contract(AddressResolverJson.abi, this.address[this.currentNet].contractAddress);
      }
    },
    callFunction(data) {
      this.callFunc(data)
        .then((data) => {
          console.log(data)
          this.$notify({
            message: data,
            type: 'success'
          });
        })
        .catch((e) => {
          console.log(e)
        })
    },
    async callFunc(data) {
      if (data.args) {
        const params = data.args.split(',')
        params[0] = getBytes32(params[0])
        return await this.contract.methods[data.func](...params).call()
      } else {
        return await this.contract.methods[data.func]().call()
      }
    },
    sendFunc(data) {
      console.log('send func', data)
      const value = 0
      const sendFunction = data.func

      const options = {
        from: Web3Service.selectedAccount,
        value: value
      }

      let func
      if (data.args) {
        const sendArgs = JSON.parse(data.args)
        if (sendFunction === 'batchTransfer' || sendFunction === 'transfer' && sendArgs.length === 2) {
          sendArgs[1] = ethToWei(sendArgs[1])
        }
        if (this.currentNet === 'DataCenterTest') {
          sendArgs[0] = getBytes32(sendArgs[0])
        }
        this.contract.methods[sendFunction](...sendArgs).estimateGas({from: Web3Service.selectedAccount})
          .then(gasAmount => {
            console.log('estimate gas: ', gasAmount)
          })
          .catch(err => {
            console.log('estimate gas occur error: ', err)
          })
        func = this.contract.methods[sendFunction](...sendArgs)
      } else {
        func = this.contract.methods[sendFunction]()
      }

      func
        .send(options)
        .once('transactionHash', (txHash) => {
          console.log({
            alert: {
              type: 'info', message: `Created transaction with hash: ${txHash}\
        Waiting for confirmation`, open: true
            }, transactionInProcess: true
          });
        })
        .once('error', (error) => {
          console.log({
            alert: {
              type: 'danger', message: `Error: ${error.message}\
        `, open: true
            }, transactionInProcess: true
          });
        })
        .then(receipt => {
          console.log(receipt)
        })
    }
  }
}
</script>

<style>
body {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  display: flex;
  min-height: 98vh;
  flex-direction: column;
  font-size: 1.5rem
}

.el-container {
  align-items: center;
}
.main-section {
  width: 80%;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  font-size: 1.2rem;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.title {
  font-size: 2rem;
}

.main-card {
  margin-top: 20px;
}

header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer {
  text-align: center;
  color: #b2b2b2;
}
footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
