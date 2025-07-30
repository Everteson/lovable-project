"""
Script para inicializar o banco de dados com dados de exemplo.
Execute este script após instalar as dependências para configurar o backend.
"""

import sys
import os
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import User, SiteSetting, PortfolioItem, CommissionRequest, PortfolioCategory
from passlib.context import CryptContext
import uuid
import json

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_tables():
    """Criar todas as tabelas do banco de dados."""
    print("🗄️ Criando tabelas do banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!")

def create_admin_user(db: Session):
    """Criar usuário administrador padrão."""
    print("👤 Criando usuário administrador...")
    
    # Verificar se já existe um admin
    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        print("⚠️ Usuário administrador já existe!")
        return existing_admin
    
    # Criar admin
    hashed_password = pwd_context.hash("admin123")  # Senha padrão
    admin_user = User(
        id=str(uuid.uuid4()),
        email="admin@minsk.art",
        hashed_password=hashed_password,
        display_name="MINSK Admin",
        role="admin",
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print("✅ Usuário administrador criado!")
    print(f"   Email: {admin_user.email}")
    print(f"   Senha: admin123")
    print("   ⚠️ ALTERE A SENHA EM PRODUÇÃO!")
    
    return admin_user

def create_default_settings(db: Session):
    """Criar configurações padrão do site."""
    print("⚙️ Criando configurações padrão...")
    
    default_settings = [
        {
            "key": "commissions_open",
            "value": "true",
            "description": "Status das comissões (aberto/fechado)"
        },
        {
            "key": "terms_of_service",
            "value": """# Termos de Serviço

## Especificações da Comissão
Todas as comissões são criadas digitalmente em alta resolução (300 DPI mínimo) e entregues em formato PNG. O cliente receberá a arte final sem marca d'água após o pagamento completo.

O prazo de entrega varia entre 3 a 14 dias úteis, dependendo da complexidade do projeto. Prazos específicos serão acordados antes do início do trabalho.

## Condições de Pagamento
O pagamento é dividido em duas partes: 50% no início do projeto (após aprovação do esboço) e 50% na entrega final.

Pagamentos são aceitos via PIX, PayPal ou transferência bancária. Outras formas de pagamento podem ser negociadas.

## Processo de Revisão
O cliente terá direito a 2 revisões gratuitas durante o processo: uma no esboço inicial e uma na arte quase finalizada.

Revisões adicionais serão cobradas 20% do valor total da comissão por revisão.

## Direitos Autorais
O artista mantém todos os direitos autorais da obra criada. O cliente recebe direitos de uso conforme especificado no acordo.

Uso comercial deve ser especificado e acordado previamente, podendo haver cobrança adicional.

## FAÇO / NÃO FAÇO

### FAÇO:
• Personagens originais e fanart
• Emotes para streaming
• Banners e headers
• Ilustrações de personagens
• Arte estilo chibi
• Badges e ícones
• Wallpapers personalizados
• Arte de casal (romantic)
• Redesigns de personagens

### NÃO FAÇO:
• Conteúdo NSFW explícito
• Arte com teor político
• Conteúdo que promova ódio
• Cópia exata de outros artistas
• Mechs complexos
• Paisagens realistas detalhadas
• Anatomia hiper-realista
• Arte para uso em NFTs (sem acordo prévio)""",
            "description": "Termos de serviço do site"
        },
        {
            "key": "pricing_info",
            "value": json.dumps([
                {"service": "Ícone", "price": "R$ 25", "description": "Avatar simples, busto básico"},
                {"service": "Meio Corpo", "price": "R$ 40", "description": "Cintura para cima, mais detalhado"},
                {"service": "Corpo Todo", "price": "R$ 60", "description": "Personagem completo"},
                {"service": "Emotes", "price": "R$ 15", "description": "Cada emote para stream"},
                {"service": "Banner", "price": "R$ 50", "description": "Header para redes sociais"},
                {"service": "Wallpaper", "price": "R$ 80", "description": "Papel de parede personalizado"},
                {"service": "Badges", "price": "R$ 20", "description": "Distintivos para stream"},
                {"service": "Chibi's", "price": "R$ 30", "description": "Estilo fofo e simplificado"},
                {"service": "5 Emotes (Pacote)", "price": "R$ 60", "description": "5 emotes personalizados - Economia de R$ 15"},
                {"service": "5 Emotes + 3 Badges", "price": "R$ 105", "description": "Pacote completo - Economia de R$ 30"},
                {"service": "Pacote Streamer Completo", "price": "R$ 200", "description": "1 banner + 8 emotes + 5 badges + 1 overlay - Economia de R$ 70"}
            ]),
            "description": "Informações de preços em formato JSON"
        },
        {
            "key": "work_hours",
            "value": json.dumps({
                "monday": "09:00-17:00",
                "tuesday": "09:00-17:00", 
                "wednesday": "09:00-17:00",
                "thursday": "09:00-17:00",
                "friday": "09:00-17:00",
                "saturday": "Fechado",
                "sunday": "Fechado"
            }),
            "description": "Horários de atendimento em formato JSON"
        }
    ]
    
    created_count = 0
    for setting_data in default_settings:
        existing = db.query(SiteSetting).filter(SiteSetting.key == setting_data["key"]).first()
        if not existing:
            new_setting = SiteSetting(**setting_data)
            db.add(new_setting)
            created_count += 1
    
    db.commit()
    print(f"✅ {created_count} configurações criadas!")

def create_sample_portfolio(db: Session):
    """Criar itens de exemplo no portfólio."""
    print("🎨 Criando itens de exemplo no portfólio...")
    
    # Verificar se já existem itens
    existing_items = db.query(PortfolioItem).count()
    if existing_items > 0:
        print("⚠️ Itens de portfólio já existem!")
        return
    
    sample_items = [
        {
            "title": "Magical Chibi Girl",
            "description": "Adorable chibi character with magical girl theme, featuring sparkles and pastel colors.",
            "category": "Chibi",
            "image_url": "/uploads/portfolio/sample-chibi-1.jpg",
            "is_featured": True
        },
        {
            "title": "Cyberpunk Gaming Banner", 
            "description": "Vibrant banner design with neon colors and geometric patterns, perfect for streaming.",
            "category": "Banners",
            "image_url": "/uploads/portfolio/sample-banner-1.jpg",
            "is_featured": True
        },
        {
            "title": "Happy Heart Eyes Emote",
            "description": "Cute emote expressing love and happiness, perfect for Twitch chat interactions.",
            "category": "Emotes", 
            "image_url": "/uploads/portfolio/sample-emote-1.jpg",
            "is_featured": False
        },
        {
            "title": "Mystical Elf Warrior",
            "description": "Fantasy character concept art featuring an elegant elf with magical elements.",
            "category": "Concept Art",
            "image_url": "/uploads/portfolio/sample-concept-1.jpg",
            "is_featured": True
        }
    ]
    
    for item_data in sample_items:
        portfolio_item = PortfolioItem(
            id=str(uuid.uuid4()),
            **item_data
        )
        db.add(portfolio_item)
    
    db.commit()
    print(f"✅ {len(sample_items)} itens de portfólio criados!")

def create_sample_commission(db: Session):
    """Criar uma comissão de exemplo."""
    print("📝 Criando comissão de exemplo...")
    
    # Verificar se já existem comissões
    existing_commissions = db.query(CommissionRequest).count()
    if existing_commissions > 0:
        print("⚠️ Comissões de exemplo já existem!")
        return
    
    sample_commission = CommissionRequest(
        id=str(uuid.uuid4()),
        full_name="João Silva",
        discord_id="joao#1234",
        email="joao@exemplo.com",
        project_description="Gostaria de uma arte chibi do meu personagem de RPG. Ele é um mago élfico com cabelos longos azuis e veste uma túnica roxa. Quero que ele esteja segurando um cajado mágico com cristais brilhantes.",
        status="pending",
        payment_status="pending",
        progress_status="in_queue",
        file_reference="https://exemplo.com/referencia.jpg"
    )
    
    db.add(sample_commission)
    db.commit()
    print("✅ Comissão de exemplo criada!")

def create_upload_directories():
    """Criar diretórios de upload."""
    print("📁 Criando diretórios de upload...")
    
    directories = [
        "uploads",
        "uploads/portfolio", 
        "uploads/profiles",
        "uploads/backgrounds"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    print("✅ Diretórios de upload criados!")

def main():
    """Função principal de inicialização."""
    print("🚀 Inicializando banco de dados do MINSK Art Backend...")
    print("=" * 50)
    
    try:
        # Criar diretórios
        create_upload_directories()
        
        # Criar tabelas
        create_tables()
        
        # Criar sessão do banco
        db = SessionLocal()
        
        try:
            # Criar dados iniciais
            create_admin_user(db)
            create_default_settings(db)
            create_sample_portfolio(db)
            create_sample_commission(db)
            
            print("=" * 50)
            print("✅ Inicialização concluída com sucesso!")
            print()
            print("🔑 Credenciais do administrador:")
            print("   Email: admin@minsk.art")
            print("   Senha: admin123")
            print()
            print("🚀 Para iniciar o servidor:")
            print("   cd backend")
            print("   python main.py")
            print()
            print("📚 Documentação da API:")
            print("   http://localhost:8000/docs")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Erro durante a inicialização: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
