<script lang="ts" setup>
const userQuestion = ref("");
const messageList = ref<String[]>([])
const addMessageList = (value: String) => {
  messageList.value.push(value)
}
// const { data } = await useFetch("/api/user");
// console.log("data: ", data._value);
const launch = async () => {
  if (!userQuestion.value) return;
  const message = await useFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment: userQuestion.value }),
  });
  console.log(message, 'message');
  // addMessageList(message.answer);
};
</script>

<template>
  <div class="box">
    <el-input v-model="userQuestion"></el-input>
    <el-button @click="launch">save</el-button>
  </div>
</template>

<style lang="scss" scoped></style>
