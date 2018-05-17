<template>
    <el-form ref="form" :model="form" label-width="120px" :rules="rules">
      <el-form-item label="执行函数" prop="func" required>
        <el-input v-model="form.func"></el-input>
      </el-form-item>
      <el-form-item label="执行参数" prop="args" >
        <el-input v-model="form.args"></el-input>
      </el-form-item>
      <el-form-item class="submit-line-item">
        <el-button type="primary" @click="submitForm('form')">立即执行</el-button>
        <el-button @click="resetForm('form')">重置</el-button>
      </el-form-item>
    </el-form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        func: '',
        args: '',
      },
      rules: {
        func: [
          { required: true, message: '请输入要执行的函数名称', trigger: 'blur' }
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
