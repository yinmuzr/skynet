import { mount } from '@vue/test-utils';
import SkynetErrorTip from '@/components/ErrorTip.vue';

describe('ErrorTip.vue', () => {
  it('renders the error message when set the message', () => {
    const wrapper = mount(SkynetErrorTip);
    wrapper.setData({ errorMessage: 'ERROR' });
    expect(wrapper.text()).toMatch('ERROR');
  });

  it('renders the default error message when not set the message', () => {
    const wrapper = mount(SkynetErrorTip);
    expect(wrapper.text()).toMatch('发生错误，提交失败');
  });
});
