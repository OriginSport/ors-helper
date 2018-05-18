<template>
  <el-container>
    <el-header>
    <div class="title">{{title}}</div>
    </el-header>
    <el-main class="main-section">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">批量发送糖果</el-menu-item>
      <el-menu-item index="2">发送 Token</el-menu-item>
      <el-menu-item index="3">执行函数</el-menu-item>
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
    <div class="main-card" v-else v-loading="loading" element-loading-text="交易确认中，请耐心等待...">
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
// import {weiToEth, ethToWei, formatEth, formatToken, getStr} from '../utils/ethUtils'
import {ethToWei} from '../utils/ethUtils'
 
export default {
  data() {
    return {
      title: 'ORSHelper',
      loading: false,
      listLoading: false,
      activeIndex: '2',
      batchDesc: '目标地址，最多20个，使用逗号隔开',
      singleDesc: '目标地址（只能填写一个）',
      token: {},
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
      let d = {}
      let arr = []
      d['func'] = 'batchTransfer'
      arr.push(data.recipients.split(','))
      arr.push(data.value)
      d['args'] = JSON.stringify(arr)
      this.submitFunction(d)
    },
    submitTransfer(data) {
      let d = {}
      let arr = []
      d['func'] = 'transfer'
      d['args'] = []
      arr.push(data.recipients)
      arr.push(data.value)
      d['args'] = JSON.stringify(arr)
      this.submitFunction(d)
    },
    submitFunction(data) {
      let d = {}
      let arr = []
      d['func'] = data.func
      arr.push(data.args)
      d['args'] = JSON.stringify(arr)
      this.callFunc(d)
    },
    handleSelect(key) {
      this.activeIndex = key
    },
    async instantiateContract() {
      // const account = Web3Service.selectedAccount;
      const addr = '0xeb9a4b185816c354db92db09cc3b50be60b901b6'
      this.token = new Web3Service.web3.eth.Contract(OriginSportToken.abi, addr);
    },
    callFunc(data) {
      console.log(data)
      const value = 0
      const callFunction = data.func

      const options = {
        from: Web3Service.selectedAccount,
        value: value
      }

      let func
      if (data.args) {
        const callArgs = JSON.parse(data.args)
        if (callFunction === 'batchTransfer' || callFunction === 'transfer' && callArgs.length === 2) {
          callArgs[1] = ethToWei(callArgs[1])
        }
        func = this.token.methods[callFunction](...callArgs)
      } else {
        func = this.token.methods[callFunction]()
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
