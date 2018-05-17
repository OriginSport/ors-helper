<template>
    <el-form ref="form" :model="form" label-width="120px" :rules="rules">
      <el-form-item :label="addressDesc" prop="recipients" required>
        <el-input v-model="form.recipients" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="发送数量" prop="value" required>
        <el-input type="number" v-model="form.value"></el-input>
      </el-form-item>
      <el-form-item class="submit-line-item">
        <el-button type="primary" @click="submitForm('form')">发送</el-button>
        <el-button @click="resetForm('form')">重置</el-button>
      </el-form-item>
    </el-form>
</template>

<script>
export default {
  props: ['addressDesc'],
  data() {
    return {
      form: {
        recipients: '',
        value: '',
      },
      rules: {
        recipients: [
          { required: true, message: '请输入接收者钱包地址', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入发送的具体数量', trigger: 'blur' }
        ],
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit('submitData', this.form)
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  }
}
</script>

<style>
.submit-line-item .el-form-item__content {
  display: flex;
  justify-content: space-around;
}
</style>
