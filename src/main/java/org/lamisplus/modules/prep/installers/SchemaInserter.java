package org.lamisplus.modules.prep.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(1)
@Installer(name = "schema-installer-insert", description = "Insert the required database tables data", version = 1)
public class SchemaInserter extends AcrossLiquibaseInstaller {
    public SchemaInserter() {
        super("classpath:installers/prep/schema/insert.xml");
    }
}
