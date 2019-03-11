<template functional>
  <Row class="container">
    <Col :span="6" class="horizontal-section navigator-section">
      <slot name="navigator" />
    </Col>
    <Col :span="18" class="horizontal-section">
      <slot/>
    </Col>
  </Row>
</template>

<style scoped lang="scss">
  @import "@/styles/var.scss";
  .horizontal-section {
    height: $--horizontal-section-height;
  }
  .navigator-section {
    border-right: solid 1px #d2dce9;
    background-color: #f9fbfd;
  }
</style>
