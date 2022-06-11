import { PropType } from 'vue';
/**
 * 自定义弹幕
 */
declare type CustomDanmu = {
    [key: string]: any;
};
/**
 * 弹幕类型
 */
declare type Danmu = string | CustomDanmu;
declare const _default: import("vue").DefineComponent<{
    /**
     * 弹幕列表数据
     */
    danmus: {
        type: PropType<Danmu[]>;
        required: true;
        default: () => never[];
    };
    /**
     * 轨道数量，0为最大轨道数量（撑满容器）
     */
    channels: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * 是否自动播放
     */
    autoplay: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * 是否循环播放
     */
    loop: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * 是否开启弹幕插槽，默认否
     */
    useSlot: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * 弹幕刷新频率(ms)
     */
    debounce: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * 是否开启随机轨道注入弹幕
     */
    randomChannel: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * 弹幕速度（像素/秒）
     */
    speeds: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * 弹幕字号（仅文本模式）
     */
    fontSize: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * 弹幕垂直间距
     */
    top: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * 弹幕水平间距
     */
    right: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * 弹幕额外样式
     */
    extraStyle: {
        type: StringConstructor;
        default: string;
    };
}, {
    container: import("vue").Ref<HTMLDivElement>;
    dmContainer: import("vue").Ref<HTMLDivElement>;
    hidden: import("vue").Ref<boolean>;
    paused: import("vue").Ref<boolean>;
    setChannels: (channels: number) => void;
    getPlayState: () => boolean;
    resize: () => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    show: () => void;
    hide: () => void;
    reset: () => void;
    add: (danmu: Danmu) => void;
    push: (danmu: Danmu) => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "done"[], "done", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    danmus: Danmu[];
    channels: number;
    autoplay: boolean;
    loop: boolean;
    useSlot: boolean;
    debounce: number;
    randomChannel: boolean;
    speeds: number;
    fontSize: number;
    top: number;
    right: number;
    extraStyle: string;
} & {}>, {
    danmus: Danmu[];
    channels: number;
    autoplay: boolean;
    loop: boolean;
    useSlot: boolean;
    debounce: number;
    randomChannel: boolean;
    speeds: number;
    fontSize: number;
    top: number;
    right: number;
    extraStyle: string;
}>;
export default _default;
