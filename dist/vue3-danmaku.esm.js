import { defineComponent, toRefs, onMounted, onBeforeUnmount, ref, reactive, watch, nextTick, createApp, h, openBlock, createBlock, createVNode, renderSlot } from 'vue';

var script = defineComponent({
    components: {},
    props: {
        /**
         * 弹幕列表数据
         */
        danmus: {
            type: Array,
            required: true,
            default: () => [],
        },
        /**
         * 轨道数量，0为最大轨道数量（撑满容器）
         */
        channels: {
            type: Number,
            default: 0,
        },
        /**
         * 是否自动播放
         */
        autoplay: {
            type: Boolean,
            default: true,
        },
        /**
         * 是否循环播放
         */
        loop: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否开启弹幕插槽，默认否
         */
        useSlot: {
            type: Boolean,
            default: false,
        },
        /**
         * 弹幕刷新频率(ms)
         */
        debounce: {
            type: Number,
            default: 400,
        },
        /**
         * 是否开启随机轨道注入弹幕
         */
        randomChannel: {
            type: Boolean,
            default: false,
        },
        /**
         * 弹幕速度（像素/秒）
         */
        speeds: {
            type: Number,
            default: 200,
        },
        /**
         * 弹幕字号（仅文本模式）
         */
        fontSize: {
            type: Number,
            default: 18,
        },
        /**
         * 弹幕垂直间距
         */
        top: {
            type: Number,
            default: 4,
        },
        /**
         * 弹幕水平间距
         */
        right: {
            type: Number,
            default: 0,
        },
        /**
         * 弹幕额外样式
         */
        extraStyle: {
            type: String,
            default: '',
        },
    },
    emits: ['done'],
    setup(props, { emit, slots }) {
        const { danmus, channels, autoplay, loop, useSlot, debounce, randomChannel, speeds, fontSize, top, right, extraStyle, } = toRefs(props);
        onMounted(() => {
            init();
        });
        onBeforeUnmount(() => {
            clear();
        });
        // 容器
        let container = ref(document.createElement('div'));
        let dmContainer = ref(document.createElement('div'));
        const danmakuWidth = ref(0);
        const danmakuHeight = ref(0);
        // 变量
        let timer = 0;
        const danmuList = ref([]);
        const paused = ref(false);
        const index = ref(0);
        const hidden = ref(false);
        const danChannel = ref({});
        const danmaku = reactive({
            channels: 0,
            autoplay: true,
            loop: false,
            useSlot: false,
            debounce: 100,
            randomChannel: false, // 随机选择轨道插入
        });
        const danmu = reactive({
            height: 0,
            fontSize: 18,
            speeds: 200,
            top: 4,
            right: 0, // 弹幕水平间距
        });
        watch(() => props.danmus, (val) => (danmuList.value = [...val]));
        function init() {
            initCore();
            initConfig();
            if (danmaku.autoplay) {
                play();
            }
        }
        function initCore() {
            danmakuWidth.value = container.value.offsetWidth;
            danmakuHeight.value = container.value.offsetHeight;
        }
        function initConfig() {
            danmus.value.forEach((item) => {
                danmuList.value.push(item);
            });
            danmaku.channels = channels.value;
            danmaku.autoplay = autoplay.value;
            danmaku.loop = loop.value;
            danmaku.useSlot = useSlot.value;
            danmaku.debounce = debounce.value;
            danmaku.randomChannel = randomChannel.value;
            danmu.fontSize = fontSize.value;
            danmu.speeds = speeds.value;
            danmu.top = top.value;
            danmu.right = right.value;
        }
        function play() {
            paused.value = false;
            if (!timer) {
                timer = setInterval(() => draw(), debounce.value);
            }
        }
        /**
         * 绘制弹幕
         */
        function draw() {
            if (!paused.value && danmuList.value.length) {
                if (index.value > danmuList.value.length - 1) {
                    if (danmaku.loop) {
                        index.value = 0;
                        insert();
                    }
                    // 播放完成
                    emit('done');
                }
                else {
                    insert();
                }
            }
        }
        /**
         * 插入弹幕
         */
        function insert() {
            const _index = loop.value ? index.value % danmuList.value.length : index.value;
            let el = document.createElement(`div`);
            if (danmaku.useSlot) {
                el = getSlotComponent(_index).$el;
            }
            else {
                el.innerHTML = danmuList.value[_index];
                el.setAttribute('style', extraStyle.value);
                el.style.fontSize = `${danmu.fontSize}px`;
                el.style.lineHeight = `${danmu.fontSize}px`;
            }
            el.classList.add('dm');
            dmContainer.value.appendChild(el);
            nextTick(() => {
                if (!danmu.height || !danmaku.channels) {
                    danmu.height = el.offsetHeight;
                    // 如果没有设置轨道数，则在获取到所有高度后计算出最大轨道数
                    if (!danmaku.channels) {
                        danmaku.channels = Math.floor(danmakuHeight.value / (danmu.height + danmu.top));
                    }
                }
                let channelIndex = getChannelIndex(el);
                if (channelIndex >= 0) {
                    const width = el.offsetWidth;
                    const height = danmu.height;
                    const speeds = danmakuWidth.value / danmu.speeds;
                    el.classList.add('move');
                    el.style.animationDuration = `${speeds}s`;
                    el.style.top = channelIndex * (height + danmu.top) + 'px';
                    el.style.width = width + danmu.right + 'px';
                    // @ts-ignore: HTML Element不一定有width属性
                    el.style.setProperty('--dm-left-offset', `-${danmakuWidth.value}px`);
                    el.dataset.index = `${_index}`;
                    el.addEventListener('animationend', () => {
                        dmContainer.value.removeChild(el);
                    });
                    if (el.classList.length > 0) {
                        index.value++;
                    }
                }
                else {
                    if (el.classList.length > 0) {
                        dmContainer.value.removeChild(el);
                    }
                }
            });
        }
        function getChannelIndex(el) {
            let _channels = [...Array(danmaku.channels).keys()];
            if (danmaku.randomChannel) {
                _channels = _channels.sort(() => 0.5 - Math.random());
            }
            for (let i of _channels) {
                const items = danChannel.value[i];
                if (items && items.length) {
                    for (let j = 0; j < items.length; j++) {
                        const danRight = getDanRight(items[j]) - 10;
                        // 安全距离判断
                        if (danRight <= (el.offsetWidth - items[j].offsetWidth) * 0.88 || danRight <= 0) {
                            break;
                        }
                        if (j === items.length - 1) {
                            danChannel.value[i].push(el);
                            el.addEventListener('animationend', () => danChannel.value[i].splice(0, 1));
                            return i % danmaku.channels;
                        }
                    }
                }
                else {
                    danChannel.value[i] = [el];
                    el.addEventListener('animationend', () => danChannel.value[i].splice(0, 1));
                    return i % danmaku.channels;
                }
            }
            return -1;
        }
        function getSlotComponent(index) {
            const DmComponent = createApp({
                render() {
                    return h('div', {}, [
                        // @ts-ignore 我也不懂tslint报错的原因，以后再修吧
                        slots.dm({
                            danmu: danmuList.value[index],
                            index,
                        }),
                    ]);
                },
            });
            const ele = DmComponent.mount(document.createElement('div'));
            return ele;
        }
        /**
         * 获取弹幕右侧到屏幕右侧的距离
         */
        function getDanRight(el) {
            const eleWidth = el.offsetWidth || parseInt(el.style.width);
            const eleRight = el.getBoundingClientRect().right || dmContainer.value.getBoundingClientRect().right + eleWidth;
            return dmContainer.value.getBoundingClientRect().right - eleRight;
        }
        function clearTimer() {
            clearInterval(timer);
            timer = 0;
        }
        /**
         * 清空弹幕
         */
        function clear() {
            clearTimer();
            index.value = 0;
        }
        /**
         * 重置弹幕
         */
        function reset() {
            danmu.height = 0;
            init();
        }
        /**
         * 停止弹幕
         */
        function stop() {
            danChannel.value = {};
            dmContainer.value.innerHTML = '';
            paused.value = true;
            hidden.value = false;
            clear();
            initConfig();
        }
        /**
         * 暂停弹幕
         */
        function pause() {
            paused.value = true;
        }
        /**
         * 添加弹幕（插入到当前播放的弹幕位置）
         */
        function add(danmu) {
            const _index = index.value % danmuList.value.length;
            danmuList.value.splice(_index, 0, danmu);
        }
        /**
         * 添加弹幕（插入到弹幕末尾）
         */
        function push(danmu) {
            danmuList.value.push(danmu);
        }
        /**
         * 设置轨道
         */
        function setChannels(channels) {
            danmaku.channels = channels;
        }
        /**
         * 获取播放状态
         */
        function getPlayState() {
            return !paused.value;
        }
        /**
         * 显示弹幕
         */
        function show() {
            hidden.value = false;
        }
        /**
         * 隐藏弹幕
         */
        function hide() {
            hidden.value = true;
        }
        function resize() {
            initCore();
            const items = dmContainer.value.getElementsByClassName('dm');
            for (let i = 0; i < items.length; i++) {
                // items.[i].style.setProperty('--dm-left-offset', `-${container.value.offsetWidth}px`)
            }
        }
        return {
            // element
            container,
            dmContainer,
            // variable
            hidden,
            paused,
            // function
            setChannels,
            getPlayState,
            resize,
            play,
            pause,
            stop,
            show,
            hide,
            reset,
            add,
            push,
        };
    },
});

const _hoisted_1 = {
  ref: "container",
  class: "vue-danmaku"
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock("div", _hoisted_1, [
    createVNode("div", {
      ref: "dmContainer",
      class: ['danmus', { show: !_ctx.hidden }, { paused: _ctx.paused }]
    }, null, 2 /* CLASS */),
    renderSlot(_ctx.$slots, "default")
  ], 512 /* NEED_PATCH */))
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".vue-danmaku {\n  position: relative;\n  overflow: hidden;\n}\n.vue-danmaku .danmus {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  -webkit-transition: all 0.3s;\n  transition: all 0.3s;\n}\n.vue-danmaku .danmus.show {\n  opacity: 1;\n}\n.vue-danmaku .danmus.paused .dm.move {\n  animation-play-state: paused;\n}\n.vue-danmaku .danmus .dm {\n  position: absolute;\n  right: 0;\n  font-size: 20px;\n  color: #fff;\n  white-space: pre;\n  transform: translateX(100%);\n}\n.vue-danmaku .danmus .dm.move {\n  will-change: transform;\n  animation-name: moveLeft;\n  animation-timing-function: linear;\n  animation-play-state: running;\n}\n.vue-danmaku .danmus .dm.pause {\n  animation-play-state: paused;\n  z-index: 10;\n}\n@keyframes moveLeft {\n  from {\n    transform: translateX(100%);\n  }\n  to {\n    transform: translateX(var(--dm-left-offset));\n  }\n}\n@-webkit-keyframes moveLeft {\n  from {\n    -webkit-transform: translateX(100%);\n  }\n  to {\n    -webkit-transform: translateX(var(--dm-left-offset));\n  }\n}";
styleInject(css_248z);

script.render = render;
script.__file = "src/lib/Danmaku.vue";

export default script;
