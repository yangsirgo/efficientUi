<template>
    <div class="gd-district">
        <gd-select v-model="provinceCode" placeholder="省" @change="provinceChange" :disabled="disabled"
                   :gd-validate="gdValidate">
            <gd-option :value="province.code" v-for="province in provinceData" :key="province.code">{{province.name}}
            </gd-option>
        </gd-select>
        <gd-select v-if="level>=2" v-model="cityCode" placeholder="市" @change="cityChange" :disabled="disabled"
                   :gd-validate="gdValidate">
            <gd-option :value="city.code" v-for="city in cityData" :key="city.code">{{city.name}}</gd-option>
        </gd-select>
        <gd-select v-if="level>=3" v-model="areaCode" placeholder="区" @change="areaChange" :disabled="disabled"
                   :gd-validate="gdValidate">
            <gd-option :value="area.code" v-for="area in areaData" :key="area.code">{{area.name}}</gd-option>
        </gd-select>
    </div>
</template>
<script>
    import districtData from './districtData.js'

    let directCity = ['110000', '120000', '310000', '500000']; //北京，天津，上海，重庆
    //根据地区名获取地区代码
    function getDirectCode(direct) {
        let provinceCode = '';
        let cityCode = '';
        let areaCode = '';
        if (direct instanceof Array) {
            //省一级，名字相同即为地区代码
            let provinceData = getProvince();
            if (isDirectCity(provinceCode)) {
                $.each(provinceData, (i, d) => {
                    if (direct[0].slice(0,2) === d.name.slice(0,2)) {//修改直辖市 回显不显示的bug 判断条件更改， 原代码 if (direct[0] === d.name.slice(0, -1)) {  共修改两处
                        provinceCode = d.code;
                        return false;
                    }
                });
            } else {
                $.each(provinceData, (i, d) => {
                    if (direct[0].slice(0,2) === d.name.slice(0,2)) {//修改直辖市 回显不显示的bug 判断条件更改， 原代码 if (direct[0] === d.name) {  共修改两处
                        provinceCode = d.code;
                        return false;
                    }
                });
            }
            if (provinceCode) {
                //直辖市，省的代码即为市的代码
                if (isDirectCity(provinceCode)) {
                    cityCode = provinceCode;
                } else {
                    let cityData = getCityInProvince(provinceCode);
                    //非直辖市，名字相同
                    $.each(cityData, (i, d) => {
                        if (direct[1] === d.name) {
                            cityCode = d.code;
                            return false;
                        }
                    });
                }
            }
            if (cityCode) {
                let areaData = getAreaInCity(cityCode);
                if (isDirectCity(cityCode)) {
                    //区代码，直辖市前两位与省代码相同，名字相同，最后两位不是0
                    $.each(areaData, (i, d) => {
                        if (direct[2] === d.name) {
                            areaCode = d.code;
                            return false;
                        }
                    });
                } else {
                    //区代码，非辖市前4位与省代码相同，名字相同，最后两位不是0
                    $.each(areaData, (i, d) => {
                        if (direct[2] === d.name) {
                            areaCode = d.code;
                            return false;
                        }
                    });
                }
            }
        }
        return [provinceCode, cityCode, areaCode];
    }

    //获取省
    function getProvince() {
        return $.map(districtData, d => {
            if (d.code.substr(2, 4) === '0000') {
                let value = gd.clone(d);
                if (isDirectCity(d.code)) {
                    value.name = value.name.slice(0, -1);
                }
                return value;
            }
        });
    }

    //获取省下的市
    function getCityInProvince(provinceCode) {
        if (!provinceCode) {
            return [];
        }
        if (isDirectCity(provinceCode)) {
            return districtData.filter(d => {
                return provinceCode === d.code;
            });
        } else {
            return districtData.filter(d => {
                return (
                    d.code.substr(0, 2) === provinceCode.substr(0, 2) &&
                    d.code.substr(2, 2) !== '00' &&
                    d.code.substr(4, 2) === '00'
                );
            });
        }
    }

    //获取市下的地区
    function getAreaInCity(cityCode) {
        if (!cityCode) {
            return [];
        }
        if (isDirectCity(cityCode)) {
            return districtData.filter(d => {
                return cityCode.substr(0, 2) === d.code.substr(0, 2) && d.code.substr(3, 3) !== '000';//针对直辖市110000下的市辖区 110100 情况  判断条件更改，原代码为d.code.substr(4, 2) !== '00'
            });
        } else {
            if (isDirectCity(cityCode)) {
                return districtData.filter(d => {
                    return d.code.substr(0, 2) === cityCode.substr(0, 2) && d.code.substr(3, 3) !== '000';//针对直辖市110000下的市辖区 110100 情况  判断条件更改，原代码为d.code.substr(4, 2) !== '00'
                });
            } else {
                return districtData.filter(d => {
                    return d.code.substr(0, 4) === cityCode.substr(0, 4) && d.code.substr(4, 2) !== '00';
                });
            }
        }
    }

    //判断是否是直辖市
    function isDirectCity(code) {
        return directCity.indexOf(code) > -1;
    }

    //根据代码获取地区数据
    function getDistrictInfoByCode(code) {
        let info = null;
        $.each(districtData, (i, d) => {
            if (d.code === code) {
                info = gd.clone(d);
                return false;
            }
        });
        return info;
    }

    export default {
        props: {
            level: {
                default: 3
            },
            disabled: {},
            value: {},
            gdValidate: {}
        },
        data() {
            let district = getDirectCode(this.value);
            let province = getDistrictInfoByCode(district[0]) || {};
            let city = getDistrictInfoByCode(district[1]) || {};
            let area = getDistrictInfoByCode(district[2]) || {};
            return {
                provinceCode: district[0],
                cityCode: district[1],
                areaCode: district[2],
                province: {
                    text: province.name || '',
                    value: province.code || ''
                },
                city: {
                    text: city.name || '',
                    value: city.code || ''
                },
                area: {
                    text: area.name || '',
                    value: area.code || ''
                },
                provinceData: getProvince(),
                cityData: getCityInProvince(district[0]),
                areaData: getAreaInCity(district[1])
            };
        },
        model: {
            prop: 'value',
            event: 'updateModel'
        },
        methods: {
            //省改变
            provinceChange(province) {
                this.province = province;
                this.cityData = getCityInProvince(this.provinceCode);
                if (isDirectCity(this.provinceCode)) {
                    this.city = province;
                    this.cityCode = this.provinceCode;
                    let city = gd.clone(province);
                    city.text += '市';
                    this.cityChange(city);
                } else {
                    this.cityCode = '';
                    this.areaCode = '';
                    this.city = {};
                    this.area = {};
                    this.update();
                }
            },
            //市改变
            cityChange(city) {
                this.areaData = getAreaInCity(this.cityCode);
                this.areaCode = '';
                this.city = city;
                this.area = {};
                this.update();
            },
            //区改变
            areaChange(area) {
                this.area = area;
                this.update();
            },
            //数据更新
            update(unChange) {
                let nameArr = [this.province.text || ''];
                let fullArr = [getDistrictInfoByCode(this.provinceCode)];
                if (isDirectCity(this.provinceCode)) {
                    fullArr[0].name = fullArr[0].name.replace('市', '');
                }
                if (this.level >= 2) {
                    nameArr.push(this.city.text || '');
                    fullArr.push(getDistrictInfoByCode(this.cityCode));
                }
                if (this.level >= 3) {
                    nameArr.push(this.area.text || '');
                    fullArr.push(getDistrictInfoByCode(this.areaCode));
                }
                nameArr.push(fullArr);
                this.$emit('updateModel', nameArr);
                if (!unChange) {
                    this.$emit('change', nameArr);
                }
            }
        },
        computed: {},
        watch: {
            value(val, oldVal) {
                if (
                    (this.level == 1 && val[0] === oldVal[0]) ||
                    (this.level == 2 && val[0] === oldVal[0] && val[1] === oldVal[1]) ||
                    (val[0] === oldVal[0] && val[1] === oldVal[1] && val[2] === oldVal[2])
                ) {
                    return;
                }
                let district = getDirectCode(this.value);
                this.provinceCode = district[0];
                this.cityCode = district[1];
                this.areaCode = district[2];
                this.cityData = getCityInProvince(district[0]);
                this.areaData = getAreaInCity(district[1]);
                let province = getDistrictInfoByCode(district[0]) || {};
                let city = getDistrictInfoByCode(district[1]) || {};
                let area = getDistrictInfoByCode(district[2]) || {};
                this.province = {
                    text: (isDirectCity(this.provinceCode) ? province.name.replace('市', '') : province.name) || '',
                    value: province.code || ''
                };
                this.city = {
                    text: city.name || '',
                    value: city.code || ''
                };
                this.area = {
                    text: area.name || '',
                    value: area.code || ''
                };
                this.update(true);
            }
        },
        mounted() {

            this.update(true);
        }
    };

    //根据地区代码获取地区详细数据
    export function getDistrictDetailByCode(code) {
        code += '';
        let provinceCode = code.substr(0, 2) + '0000';
        let provinceInfo = getDistrictInfoByCode(provinceCode);
        let info = {
            province: null,
            city: null,
            area: null
        };
        if (isDirectCity(provinceCode)) {
            info.province = gd.clone(provinceInfo);
            info.province.name = info.province.name.replace('市', '');
            info.city = provinceInfo;
            if (code.substr(4, 2) !== '00') {
                info.area = getDistrictInfoByCode(code);
            }
        } else {
            info.province = provinceInfo;
            if (code.substr(2, 2) !== '00') {
                info.city = getDistrictInfoByCode(code.substr(0, 4) + '00');
            }
            if (code.substr(4, 2) !== '00') {
                info.area = getDistrictInfoByCode(code);
            }
        }
        return info;
    }

</script>