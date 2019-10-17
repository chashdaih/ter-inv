<template>
    <ValidationProvider :vid="vid" :name="$attrs.label" :rules="rules" v-slot="{ errors, valid }" >
        <b-field
            v-bind="$attrs"
            :type="{ 'is-danger': errors[0], 'is-success': valid }"
            :message="errors"
        >
            <b-select v-model="innerValue" @input="$emit('change')">
                <slot/>
            </b-select>
        </b-field>
    </ValidationProvider>
</template>

<script>
import { ValidationProvider } from 'vee-validate';

export default {
    components: {
        ValidationProvider
    },
    props: {
        vid: {
            type: String
        },
        rules: {
            type: [Object, String],
            default: ''
        },
        value: {
            type: null
        }
    },
    data: () => ({
        innerValue: ''
    }),
    watch: {
        innerValue(newVal) {
            this.$emit('input', newVal);
        },
        value(newVal) {
            this.innerValue = newVal;
        }
    },
    mounted() {
        if (this.value != null) {
            this.innerValue = this.value;
        }
    }
}
</script>