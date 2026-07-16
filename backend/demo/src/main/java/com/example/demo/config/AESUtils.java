package com.example.demo.config;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/*
*  TODO:
*           No tiene HTTPS de momento, así que una vez hecho bien el login funcional desde frontend, agregar que se
*           encripte desde frontend para que viaje encriptado con esta clase y para luego leerlo y guardarlo encriptado
*           con bcrypt en la BD */

public class AESUtils {

    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String KEY = "esta1es1mi1clave1secreta1de1321b"; //
    private static final String IV = "1234567890123456";

    public static String decrypt(String encryptedData) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        byte[] keyBytes = KEY.getBytes(StandardCharsets.UTF_8);
        byte[] ivBytes = IV.getBytes(StandardCharsets.UTF_8);

        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        byte[] decodedValue = Base64.getDecoder().decode(encryptedData);
        byte[] decrypted = cipher.doFinal(decodedValue);

        return new String(decrypted, StandardCharsets.UTF_8);
    }
}