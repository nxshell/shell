/**
 * Utils
 */

 /**
  * 判断一个对象是否为Promise对象
  * 
  * @param {Object} p 对象
  * @return {Boolean} 
  */
function isPromise(p) {
    return (p && typeof p.then === "function");
}

/**
 * 向指定数组插入新的元素
 * 
 * @param {Array} array 待插入元素的数组
 * @param {Any} ele 待出入的元素
 * @param {Number} pos 待插入元素的位置
 * @return {Array} 新的元素
 */
function insert(array, ele, pos) {
    if (typeof pos !== "number" || pos > array.length) {
        array.push(ele);
        return array;
    }
    if (pos <= 0) {
        array.unshift(ele);
        return array;
    }

    const left = array.splice(0, pos);
    return left.concat([ele]).concat(array);
}

/**
 * 重置数组或对象的成员元素的值到默认值
 * 不做递归处理
 * 
 * String: ""
 * Number: 0
 * Boolean: false,
 * null: null,
 * undefined: undefined
 * 
 * @param {Array | Object} o 待重置的数组或对象
 */
function resetValues(o) {
    function getDefaultValue(v) {
        let type = typeof v;
        return ({
            "string": () => "",
            "number": () => 0,
            "boolean": () => false,
            "undefined": () => undefined
        }[type] || (() => {
            if (Array.isArray(v)) {
                return [];
            } else if (v === null) {
                return null;
            } else if (v instanceof Date) {
                return new Date();
            } else {
                return v
            }
        }))()
    }
    if (Array.isArray(o)) {
        return o.map(v => {
            return getDefaultValue(v);
        });
    } else {
        Object.keys(o).forEach(key => {
            o[key] = getDefaultValue(o[key]);
        })
        return o;
    }
}

module.exports = {
    isPromise,
    insert,

    resetValues
}