import SkynetColumnTip from '@/components/ColumnTip.vue';

export default {
  components: {
    SkynetColumnTip,
  },
  methods: {
    renderColumn(h, { row, column }) {
      return <SkynetColumnTip title={row[column.key]}/>;
    },
  },
};
