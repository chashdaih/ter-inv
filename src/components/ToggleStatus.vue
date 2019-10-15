<template>
    <div class="toggleStatus">
        <button class="button is-warning" @click.prevent="isModalVisible=true">{{ des }}</button>
        <div class="modal" :class="{'is-active': isModalVisible}">
            <div class="modal-background" @click="isModalVisible=false"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">¿Está seguro que quiere {{ disabled ? 'habilitar' : 'deshabilitar' }} al usuario?</p>
                    <button class="delete" aria-label="close"  @click="isModalVisible=false"></button>
                </header>
                <section class="modal-card-body">
                    <p>Un usuario deshabilitado no puede iniciar sesión ni hacer o recibir referencias</p>
                    <p class="is-italic">Esta acción es reversible</p>
                </section>
                <footer class="modal-card-foot">
                    <button @click.prevent="isModalVisible=false" class="button">Cancelar</button>
                    <button class="button is-warning" :class="{'is-loading': changingStatus}" @click.prevent="toggleStatus" >{{ des }}</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');
import Swal from 'sweetalert2';
export default {
    props: {
        uid: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isModalVisible: false,
            changingStatus: false,
        }
    },
    computed: {
        des() {
            return this.disabled ? 'Habilitar' : 'Deshabilitar';
        }
    },
    methods: {
        toggleStatus() {
            this.changingStatus = true;
            fb.usersCollection.doc(this.uid).update({
                disabled: !this.disabled,
            })
            .then(res=>{
                this.$emit('status-changed', !this.disabled);
                Swal.fire({
                    title: 'Éxito',
                    text: 'El supervisor se actualizó exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.isModalVisible = false,
                });
            })
            .catch(err =>{
                Swal.fire({
                   title: 'Ocurrió un error',
                   text: err,
                   type: "error",
                   confirmButtonText: 'Aceptar' 
                });
            })
            .finally(()=>this.changingStatus=false)
        }
    }
}
</script>