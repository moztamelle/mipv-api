create table if not exists users (
	id INT GENERATED ALWAYS AS IDENTITY (START WITH 2008) primary key,
	name varchar(100) not null,
	email_whatsapp varchar(100) not null,
	phone varchar(20),
	address varchar(255),
	token varchar(255),
	password varchar(255),
	hash_confirmation varchar(255),
	status varchar(50),
	access varchar(10) default 'USER',
	country varchar(100),
	gender char,
	photo varchar(255),
	doc_type varchar(50),
	doc_id varchar(100),
	birthday date,
	type varchar(50)
);