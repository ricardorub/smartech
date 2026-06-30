package SmarTech.SmarTech.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "MI_CLAVE_SECRETA_SUPER_SEGURA_SMARTTECH_KEY_2025";
    private final long EXPIRATION = 1000 * 60 * 60 * 8; 

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generarToken(String username, Long idUsuario, String rol) {
        return Jwts.builder()
                .setSubject(username)
                .claim("idUsuario", idUsuario)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Long obtenerIdUsuario(String token) {
        return getClaims(token).get("idUsuario", Long.class);
    }

    public String obtenerUsuario(String token) {
        return getClaims(token).getSubject();
    }

    public String obtenerRol(String token) {
        return (String) getClaims(token).get("rol");
    }

    public boolean validarToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
