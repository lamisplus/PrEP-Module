package org.lamisplus.modules.hiv.installers;


import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(2)
@Installer(name = "regimen-installer",
        description = "Populate regimen values",
        version = 1)
public class RegimenInsertValueInstaller extends AcrossLiquibaseInstaller {
    public RegimenInsertValueInstaller() {
        super ("classpath:installers/hiv/schema/insert-regimen-value-schema.xml");
    }
}
